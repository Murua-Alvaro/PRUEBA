"use strict";
(function () {
  const el = (id) => document.getElementById(id);
  const fmt = new Intl.NumberFormat("es-MX", {maximumFractionDigits: 1});
  const money = new Intl.NumberFormat("es-MX", {notation: "compact", maximumFractionDigits: 2});
  const PRODUCTION_LIMIT = 75 * 1024 * 1024;
  let originalHeaders = [], fieldIndex = {}, allRows = [], visibleRows = [];

  function cleanKey(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  }
  function numeric(value) {
    const raw = String(value === null || value === undefined ? "" : value).trim().replace(/\s/g, "");
    if (!raw || raw === "-" || raw.toLowerCase() === "na") return null;
    let s = raw;
    if (s.includes(",") && s.includes(".")) {
      s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
    } else if (s.includes(",")) {
      s = /^\-?\d+,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "");
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  function guessDelimiter(text) {
    const line = text.split(/\r?\n/, 1)[0] || "";
    const options = [",", ";", "\t"];
    return options.sort((a, b) => line.split(b).length - line.split(a).length)[0];
  }
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    const delimiter = guessDelimiter(text);
    const records = [];
    let row = [], field = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (inQuotes && text[i + 1] === '"') {field += '"'; i++;}
        else inQuotes = !inQuotes;
      } else if (!inQuotes && ch === delimiter) {
        row.push(field); field = "";
      } else if (!inQuotes && (ch === "\n" || ch === "\r")) {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        if (row.some(v => v.trim() !== "")) records.push(row);
        row = []; field = "";
      } else field += ch;
    }
    if (inQuotes) throw new Error("El CSV contiene comillas sin cerrar.");
    row.push(field);
    if (row.some(v => v.trim() !== "")) records.push(row);
    return records;
  }
  const aliases = {
    year: ["Anio", "Año", "year"],
    state: ["Nomestado", "estado"],
    city: ["Nommunicipio", "municipio"],
    crop: ["Nomcultivo", "cultivo"],
    value: ["Valorproduccion", "Valor producción", "valor_produccion"],
    area: ["Cosechada", "superficie_cosechada"],
    volume: ["Volumenproduccion", "volumen_produccion", "produccion"],
    unit: ["Nomunidad", "unidad"]
  };
  function identifyColumns(headers) {
    const normalized = headers.map(cleanKey);
    const found = {};
    Object.entries(aliases).forEach(([key, variants]) => {
      found[key] = normalized.findIndex(h => variants.some(v => cleanKey(v) === h));
    });
    const required = ["year", "state", "city", "crop", "value", "area", "volume", "unit"];
    const missing = required.filter(k => found[k] < 0).map(k => aliases[k][0]);
    if (missing.length) throw new Error("Faltan columnas DGSIAP: " + missing.join(", ") + ". Carga un CSV con el esquema oficial.");
    return found;
  }
  const cell = (cells, index) => index >= 0 ? (cells[index] || "").trim() : "";
  function selectOptions(id, values, preserve) {
    const element = el(id);
    const before = preserve ? element.value : "";
    element.replaceChildren(new Option("Todos", ""));
    values.forEach(s => element.add(new Option(s, s)));
    element.value = values.includes(before) ? before : "";
    element.disabled = false;
  }
  function uniques(arr, key) {
    return [...new Set(arr.map(x => x[key]).filter(Boolean))].sort((a,b) => a.localeCompare(b,"es",{numeric:true}));
  }
  function setFilters() {
    selectOptions("filter-year", uniques(allRows, "year"), false);
    selectOptions("filter-state", uniques(allRows, "state"), false);
    selectOptions("filter-city", uniques(allRows, "city"), false);
    selectOptions("filter-crop", uniques(allRows, "crop"), false);
    el("clear-filters").disabled = false;
    el("export-filtered").disabled = false;
  }
  function dependents() {
    const state = el("filter-state").value;
    const city = el("filter-city").value;
    const scoped = state ? allRows.filter(r => r.state === state) : allRows;
    selectOptions("filter-city", uniques(scoped,"city"), true);
    if (city && !el("filter-city").value) el("filter-city").value = "";
    const chosen = el("filter-city").value;
    selectOptions("filter-crop", uniques(chosen ? scoped.filter(r => r.city === chosen) : scoped,"crop"), true);
  }
  function listRows() {
    const year = el("filter-year").value, state = el("filter-state").value;
    const city = el("filter-city").value, crop = el("filter-crop").value;
    return allRows.filter(r => (!year || r.year === year) && (!state || r.state === state) && (!city || r.city === city) && (!crop || r.crop === crop));
  }
  function sum(rows, key) {
    const nums = rows.map(x => x[key]).filter(Number.isFinite);
    return nums.length ? nums.reduce((a,b)=>a+b,0) : null;
  }
  function amount(n, kind) {
    if (n === null) return "—";
    if (kind === "money") return "$" + money.format(n);
    return fmt.format(n);
  }
  function barChart(id, grouped, emptyText, caption, ordering) {
    const root = el(id);
    root.replaceChildren();
    if (!grouped.length) {
      root.className = "chart-empty";
      root.textContent = emptyText;
      return;
    }
    root.className = "";
    const list = document.createElement("div"); list.className = "chart-bars";
    let items = grouped;
    if (ordering === "value") items = grouped.slice().sort((a,b) => b.value - a.value).slice(0,7);
    const max = Math.max(...items.map(x=>Math.max(0,x.value)),1);
    items.forEach(x=>{
      const item = document.createElement("div");item.className = "bar-row";
      const name = document.createElement("span");name.className = "bar-label";name.textContent = x.name;name.title = x.name;
      const track = document.createElement("div");track.className = "bar-track";
      const fill = document.createElement("div");fill.className = "bar-fill";
      fill.style.width = Math.max(0, 100 * x.value / max).toFixed(2) + "%";track.append(fill);
      const value = document.createElement("span");value.className = "bar-value";value.textContent = amount(x.value, "money");value.title = "$" + fmt.format(x.value);
      item.append(name,track,value);list.append(item);
    });
    root.append(list);
    if (caption) {const p=document.createElement("p");p.className="chart-caption";p.textContent=caption;root.append(p);}
  }
  function valueGroups(rows, key) {
    const groups = new Map();
    rows.forEach(r=>{if (r[key] && Number.isFinite(r.value)) groups.set(r[key],(groups.get(r[key])||0)+r.value);});
    return [...groups].map(([name,value])=>({name,value}));
  }
  function renderPreview(rows) {
    const tbody=el("preview-body");tbody.replaceChildren();
    if (!rows.length){const tr=document.createElement("tr");const td=document.createElement("td");td.colSpan=5;td.className="empty-cell";td.textContent="No hay registros que cumplan los filtros.";tr.append(td);tbody.append(tr);return;}
    rows.slice(0,12).forEach(row=>{
      const tr=document.createElement("tr");
      [row.year,row.state,row.city,row.crop,Number.isFinite(row.value) ? "$"+fmt.format(row.value) : "—"].forEach(s=>{
        const td=document.createElement("td");td.textContent=s;tr.append(td);
      });
      tbody.append(tr);
    });
  }
  function renderProduction() {
    visibleRows=listRows();
    el("metric-value").textContent=amount(sum(visibleRows,"value"),"money");
    el("metric-area").textContent=amount(sum(visibleRows,"area"));
    el("metric-rows").textContent=fmt.format(visibleRows.length);
    const units=uniques(visibleRows,"unit");
    const noUnit=visibleRows.some(x => !x.unit);
    if (units.length===1 && !noUnit) {
      el("metric-volume").textContent=amount(sum(visibleRows,"volume"));
      el("volume-note").textContent="Unidad: "+units[0];
    } else {
      el("metric-volume").textContent="—";
      el("volume-note").textContent=visibleRows.length ? "Sin unidad única comparable" : "Sin observaciones";
    }
    const years=valueGroups(visibleRows,"year").sort((a,b)=>Number(a.name)-Number(b.name));
    barChart("year-chart",years,"No hay valores disponibles.","Valores nominales, no deflactados.","year");
    barChart("crop-chart",valueGroups(visibleRows,"crop"),"No hay cultivos para mostrar.","Ranking de valor entre los registros filtrados.","value");
    renderPreview(visibleRows);
    el("row-count").textContent="Vista previa de "+Math.min(visibleRows.length,12)+" de "+fmt.format(visibleRows.length)+" registros filtrados. La exportación incluye todos los registros filtrados.";
  }
  async function onFile(e) {
    const file=e.target.files && e.target.files[0];
    if (!file) return;
    const status=el("upload-status");
    status.textContent="Leyendo "+file.name+"…";
    try{
      if (file.size>PRODUCTION_LIMIT) throw new Error("Este archivo supera 75 MB. Procesa previamente el paquete nacional con el notebook oficial y carga un CSV estatal o municipal.");
      const records=parseCSV(await file.text());
      if(records.length<2) throw new Error("El CSV no contiene observaciones.");
      const headers=records.shift().map(s=>s.trim().replace(/^\uFEFF/,""));
      const indexes=identifyColumns(headers);
      const data=records.map(cells=>({
        raw:cells,year:cell(cells,indexes.year),state:cell(cells,indexes.state),
        city:cell(cells,indexes.city),crop:cell(cells,indexes.crop),
        value:numeric(cell(cells,indexes.value)),area:numeric(cell(cells,indexes.area)),
        volume:numeric(cell(cells,indexes.volume)),unit:cell(cells,indexes.unit)
      }));
      if (!data.length) throw new Error("No se reconocieron filas con datos.");
      originalHeaders=headers;fieldIndex=indexes;allRows=data;
      setFilters();renderProduction();
      status.textContent="Archivo: "+file.name+" · "+fmt.format(allRows.length)+" registros importados localmente. Sin transferencia a servidor.";
    }catch(err){status.textContent="No fue posible cargarlo: "+err.message;}
  }
  function csvEscape(value) {
    const s=String(value === undefined || value === null ? "" : value);
    return /[,"\n\r]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  }
  function exportRows() {
    if(!originalHeaders.length || !visibleRows.length)return;
    const lines=[originalHeaders, ...visibleRows.map(r=>r.raw)].map(arr=>arr.map(csvEscape).join(","));
    const blob=new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="growa_agricultura_filtrado.csv";document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function resetClimate() {
    ["climate-temp","climate-rain","climate-humidity","climate-solar"].forEach(id=>el(id).textContent="—");
    el("monthly-chart").className="chart-empty";el("monthly-chart").textContent="Sin resultados disponibles.";
  }
  function validClimate(v) {
    const n=Number(v);
    return v !== null && v !== undefined && v !== "" && Number.isFinite(n) && n>-900 ? n:null;
  }
  function climateMetric(series, op) {
    const values=Object.values(series||{}).map(validClimate).filter(Number.isFinite);
    if(!values.length)return null;
    const total=values.reduce((a,b)=>a+b,0);
    return op==="sum"?total:total/values.length;
  }
  function renderMonths(series) {
    const rows=Array.from({length:12},(_,i)=>({name:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][i],value:0,days:0}));
    Object.entries(series||{}).forEach(([key,value])=>{
      const month=Number(key.slice(4,6))-1;
      const v=validClimate(value);
      if(month>=0&&month<12&&v!==null){rows[month].value+=v;rows[month].days++;}
    });
    const valid=rows.filter(x=>x.days>0);
    const chart=el("monthly-chart");
    if(!valid.length){chart.className="chart-empty";chart.textContent="No existen días válidos para construir la precipitación mensual.";return;}
    const max=Math.max(1,...valid.map(x=>x.value));chart.className="";
    const bars=document.createElement("div");bars.className="chart-bars";
    valid.forEach(x=>{
      const row=document.createElement("div");row.className="bar-row";
      const name=document.createElement("span");name.className="bar-label";name.textContent=x.name;
      const track=document.createElement("div");track.className="bar-track";
      const fill=document.createElement("div");fill.className="bar-fill";fill.style.width=(100*x.value/max).toFixed(2)+"%";track.append(fill);
      const num=document.createElement("span");num.className="bar-value";num.textContent=fmt.format(x.value)+" mm";
      row.append(name,track,num);bars.append(row);
    });chart.replaceChildren(bars);
  }
  async function onClimate(event) {
    event.preventDefault();
    const lat=Number(el("climate-lat").value),lon=Number(el("climate-lon").value),year=Number(el("climate-year").value);
    const box=el("climate-message");
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){box.textContent="Coordenadas fuera de rango.";box.className="climate-message error";return;}
    const btn=el("climate-submit");btn.disabled=true;box.className="climate-message";box.textContent="Consultando la API oficial NASA POWER…";resetClimate();
    const params=new URLSearchParams({
      parameters:"T2M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN",community:"AG",
      longitude:String(lon),latitude:String(lat),start:String(year)+"0101",end:String(year)+"1231",format:"JSON"
    });
    try{
      const response=await fetch("https://power.larc.nasa.gov/api/temporal/daily/point?"+params.toString(),{headers:{Accept:"application/json"}});
      if(!response.ok)throw new Error("NASA POWER devolvió HTTP "+response.status);
      const payload=await response.json();
      const data=payload.properties&&payload.properties.parameter;
      if(!data || !data.T2M) throw new Error("La respuesta no incluye datos climáticos de este punto y periodo.");
      el("climate-temp").textContent=amount(climateMetric(data.T2M,"mean"));
      el("climate-rain").textContent=amount(climateMetric(data.PRECTOTCORR,"sum"));
      el("climate-humidity").textContent=amount(climateMetric(data.RH2M,"mean"));
      el("climate-solar").textContent=amount(climateMetric(data.ALLSKY_SFC_SW_DWN,"mean"));
      renderMonths(data.PRECTOTCORR);
      const n=Object.values(data.T2M).filter(v=>validClimate(v)!==null).length;
      box.textContent="Consulta completada: "+n+" días con temperatura válida en "+year+". Los totales de años incompletos son parciales.";
    }catch(error){
      resetClimate();box.className="climate-message error";
      box.textContent="No fue posible consultar NASA POWER: "+error.message+". Comprueba la conexión o inténtalo de nuevo.";
    }finally{btn.disabled=false;}
  }
  function initialize() {
    el("agro-file").addEventListener("change",onFile);
    ["filter-year","filter-state","filter-city","filter-crop"].forEach(id=>
      el(id).addEventListener("change",()=>{if(id==="filter-state"||id==="filter-city") dependents();renderProduction();})
    );
    el("clear-filters").addEventListener("click",()=>{
      ["filter-year","filter-state","filter-city","filter-crop"].forEach(id=>el(id).value="");
      dependents();renderProduction();
    });
    el("export-filtered").addEventListener("click",exportRows);
    const climateYear=el("climate-year");
    const limit=Math.min(new Date().getFullYear(),2035);
    for(let year=limit;year>=2003;year--)climateYear.add(new Option(String(year),String(year)));
    climateYear.value=String(Math.min(2025,limit));
    el("climate-location").addEventListener("change",event=>{
      if(event.target.value!=="custom"){
        const [lat,lon]=event.target.value.split(",");
        el("climate-lat").value=lat;el("climate-lon").value=lon;
      }
    });
    ["climate-lat","climate-lon"].forEach(id=>el(id).addEventListener("input",()=>{el("climate-location").value="custom";}));
    el("climate-form").addEventListener("submit",onClimate);
  }
  initialize();
})();