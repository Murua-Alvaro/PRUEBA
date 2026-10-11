'use strict';

(() => {
  const $ = (id) => document.getElementById(id);
  const REPORT_PAGES = {
    'Ahome': [7, 32], 'Angostura': [35, 53], 'Badiraguato': [56, 69], 'Choix': [72, 86],
    'Concordia': [89, 107], 'Cosalá': [110, 124], 'Culiacán': [127, 152], 'El Fuerte': [155, 176],
    'Elota': [179, 199], 'Escuinapa': [202, 218], 'Guasave': [221, 242], 'Mazatlán': [245, 263],
    'Mocorito': [266, 283], 'Navolato': [286, 309], 'Rosario': [312, 329], 'Salvador Alvarado': [332, 347],
    'San Ignacio': [350, 367], 'Sinaloa': [370, 391]
  };

  const fmt1 = new Intl.NumberFormat('es-MX', {minimumFractionDigits: 1, maximumFractionDigits: 1});
  const fmt0 = new Intl.NumberFormat('es-MX', {maximumFractionDigits: 0});
  const compact = new Intl.NumberFormat('es-MX', {notation: 'compact', maximumFractionDigits: 1});

  let DATA = null;
  const UI = {
    view: 'overview',
    municipality: 'Mazatlán',
    crop: 'Maíz grano'
  };

  function n(v) {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  }

  function millions(v) {
    return Number.isFinite(v) ? fmt1.format(v) : 'n/d';
  }

  function integer(v) {
    return Number.isFinite(v) ? fmt0.format(v) : 'n/d';
  }

  function pct(v, digits = 1) {
    return Number.isFinite(v) ? `${Number(v).toFixed(digits)} %` : 'n/d';
  }

  function signed(v, digits = 1) {
    if (!Number.isFinite(v)) return 'n/d';
    const val = Number(v).toFixed(digits);
    return `${v > 0 ? '+' : ''}${val}`;
  }

  function sum(rows, key) {
    return rows.reduce((acc, row) => acc + n(row[key]), 0);
  }

  function unique(rows, key) {
    return [...new Set(rows.map((row) => row[key]).filter(Boolean))];
  }

  function clear(node) {
    node.replaceChildren();
    return node;
  }

  function showBanner(message) {
    const banner = $('banner');
    banner.hidden = !message;
    banner.textContent = message || '';
  }

  function mapTable(table) {
    return table.rows.map((row) => Object.fromEntries(table.columns.map((col, i) => [col, row[i]])));
  }

  async function decodePack() {
    const response = await fetch('./data/analysis-pack.b64');
    if (!response.ok) throw new Error(`No fue posible abrir el paquete de datos (${response.status}).`);
    const encoded = (await response.text()).replace(/\s+/g, '');
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('Tu navegador no soporta la lectura local del archivo comprimido.');
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const json = await new Response(stream).text();
    return JSON.parse(json);
  }

  function prepareData(raw) {
    const state = mapTable(raw.state).map((row) => ({
      year: Number(row.Anio),
      valueM: n(row.value) / 1000,
      area: n(row.area),
      harvest: n(row.harvest),
      loss: n(row.loss),
      rows: n(row.rows),
      crops: n(row.crops)
    })).sort((a, b) => a.year - b.year);

    const municipal = mapTable(raw.municipal).map((row) => ({
      municipality: row.Nommunicipio,
      year: Number(row.Anio),
      planted: n(row.Sembrada),
      harvest: n(row.Cosechada),
      loss: n(row.Siniestrada),
      valueM: n(row.Valorproduccion) / 1000
    })).sort((a, b) => a.year - b.year);

    const municipal2025 = mapTable(raw.municipal2025).map((row) => ({
      municipality: row.Nommunicipio,
      valueM: n(row.value) / 1000,
      area: n(row.area),
      harvest: n(row.harvest),
      loss: n(row.loss),
      crops: n(row.crops),
      rows: n(row.rows)
    }));

    const crops = mapTable(raw.crops).map((row) => ({
      municipality: row.Nommunicipio,
      crop: row.Nomcultivo,
      year: Number(row.Anio),
      unit: row.Nomunidad,
      planted: n(row.Sembrada),
      harvest: n(row.Cosechada),
      loss: n(row.Siniestrada),
      volume: n(row.Volumenproduccion),
      valueM: n(row.Valorproduccion) / 1000
    }));

    const records2025 = mapTable(raw.records2025).map((row) => ({
      ...row,
      Anio: Number(row.Anio),
      Sembrada: n(row.Sembrada),
      Cosechada: n(row.Cosechada),
      Siniestrada: n(row.Siniestrada),
      Volumenproduccion: n(row.Volumenproduccion),
      RendimientoDGSIAP: n(row.RendimientoDGSIAP),
      PrecioMedioRuralDGSIAP: n(row.PrecioMedioRuralDGSIAP),
      Valorproduccion: n(row.Valorproduccion),
      valueM: n(row.Valorproduccion) / 1000
    }));

    const municipalities = [...new Set(municipal.map((row) => row.municipality))].sort((a, b) => a.localeCompare(b, 'es'));
    const cropsIndex = [...new Set(crops.map((row) => row.crop))].sort((a, b) => a.localeCompare(b, 'es'));

    return {
      meta: raw.metadata,
      audit: raw.audit,
      state,
      municipal,
      municipal2025,
      crops,
      records2025,
      municipalities,
      cropsIndex,
      municipalityMap: Object.fromEntries(municipalities.map((name) => [name, buildMunicipalityProfile(name, {state, municipal, municipal2025, crops, records2025})])),
      cropMap: Object.fromEntries(cropsIndex.map((name) => [name, buildCropProfile(name, {crops, records2025})]))
    };
  }

  function compareLabel(value) {
    if (!Number.isFinite(value)) return 'Sin comparación válida';
    if (value > 0) return `Aumentó ${millions(value)} MDP`;
    if (value < 0) return `Disminuyó ${millions(Math.abs(value))} MDP`;
    return 'Sin cambio nominal';
  }

  function concentrationLabel(hhi) {
    if (!Number.isFinite(hhi)) return 'sin estimación';
    if (hhi >= 0.30) return 'alta concentración';
    if (hhi >= 0.20) return 'concentración intermedia';
    return 'estructura relativamente diversificada';
  }

  function buildMunicipalityProfile(name, tables) {
    const annual = tables.municipal.filter((row) => row.municipality === name).sort((a, b) => a.year - b.year);
    const cropSeries = tables.crops.filter((row) => row.municipality === name);
    const detail2025 = tables.records2025.filter((row) => row.Nommunicipio === name);
    const byCrop2025 = aggregateBy(detail2025, 'Nomcultivo');
    const currentMap = new Map(byCrop2025.map((row) => [row.key, row]));
    const hist2025 = cropSeries.filter((row) => row.year === 2025);
    const hist2024 = cropSeries.filter((row) => row.year === 2024);
    const hist2024Map = new Map(hist2024.map((row) => [row.crop, row]));
    const hist2025Map = new Map(hist2025.map((row) => [row.crop, row]));
    const cropNames = [...new Set(cropSeries.map((row) => row.crop))].sort((a, b) => a.localeCompare(b, 'es'));

    const comparisons = cropNames.map((crop) => {
      const y24 = hist2024Map.get(crop) || null;
      const y25 = hist2025Map.get(crop) || null;
      const delta = y24 && y25 ? y25.valueM - y24.valueM : null;
      const share = currentMap.get(crop) ? (currentMap.get(crop).valueM / Math.max(sum(detail2025, 'valueM'), 1)) * 100 : null;
      return {
        crop,
        reported2024: !!y24,
        reported2025: !!y25,
        value2024: y24 ? y24.valueM : null,
        value2025: y25 ? y25.valueM : null,
        delta,
        changePct: y24 && y25 && y24.valueM > 0 ? ((y25.valueM / y24.valueM) - 1) * 100 : null,
        unit: y25?.unit || y24?.unit || null,
        series: cropSeries.filter((row) => row.crop === crop).sort((a, b) => a.year - b.year),
        detail2025: detail2025.filter((row) => row.Nomcultivo === crop),
        share2025: share
      };
    });

    comparisons.sort((a, b) => (b.value2025 || -1) - (a.value2025 || -1) || a.crop.localeCompare(b.crop, 'es'));
    const topCrops = comparisons.filter((row) => Number.isFinite(row.value2025)).slice(0, 12);
    const positive = comparisons.filter((row) => Number.isFinite(row.delta) && row.delta > 0).sort((a, b) => b.delta - a.delta);
    const negative = comparisons.filter((row) => Number.isFinite(row.delta) && row.delta < 0).sort((a, b) => a.delta - b.delta);
    const notReported2025 = comparisons.filter((row) => row.reported2024 && !row.reported2025).map((row) => row.crop);
    const newlyReported2025 = comparisons.filter((row) => !row.reported2024 && row.reported2025).map((row) => row.crop);
    const totalValue2025 = sum(detail2025, 'valueM');
    const totalValue2024 = annual.find((row) => row.year === 2024)?.valueM ?? null;
    const changePct = Number.isFinite(totalValue2024) && totalValue2024 > 0 ? ((totalValue2025 / totalValue2024) - 1) * 100 : null;
    const hhi = hhiFromRows(byCrop2025);
    const topShare = topCrops.slice(0, 3).reduce((acc, row) => acc + (row.share2025 || 0), 0);

    return {
      name,
      annual,
      detail2025,
      comparisons,
      topCrops,
      positive,
      negative,
      notReported2025,
      newlyReported2025,
      totalValue2025,
      totalValue2024,
      totalHarvest2025: sum(detail2025, 'Cosechada'),
      totalPlanted2025: sum(detail2025, 'Sembrada'),
      cropCount2025: byCrop2025.length,
      hhi,
      topShare,
      leader: topCrops[0] || null,
      reportPages: REPORT_PAGES[name] || null,
      composition2025: {
        varieties: aggregateBy(detail2025, 'Nomvariedad'),
        modalities: aggregateBy(detail2025, 'Nommodalidad'),
        cycles: aggregateBy(detail2025, 'Nomcicloproductivo'),
        technologies: aggregateBy(detail2025, 'TipoTecnologia'),
        productionTypes: aggregateBy(detail2025, 'TipoProduccion'),
        markets: aggregateBy(detail2025, 'TipoMercado')
      },
      changePct
    };
  }

  function buildCropProfile(name, tables) {
    const cropSeries = tables.crops.filter((row) => row.crop === name);
    const detail2025 = tables.records2025.filter((row) => row.Nomcultivo === name);
    const annual = [...new Set(cropSeries.map((row) => row.year))].sort((a, b) => a - b).map((year) => {
      const rows = cropSeries.filter((row) => row.year === year);
      return {
        year,
        valueM: sum(rows, 'valueM'),
        harvest: sum(rows, 'harvest'),
        planted: sum(rows, 'planted'),
        volume: sum(rows, 'volume')
      };
    });
    const municipal2025 = aggregateBy(detail2025, 'Nommunicipio');
    const varieties = aggregateBy(detail2025, 'Nomvariedad');
    const modalities = aggregateBy(detail2025, 'Nommodalidad');
    const cycles = aggregateBy(detail2025, 'Nomcicloproductivo');
    const technologies = aggregateBy(detail2025, 'TipoTecnologia');
    const productionTypes = aggregateBy(detail2025, 'TipoProduccion');
    const markets = aggregateBy(detail2025, 'TipoMercado');

    const byMunicipality = [...new Set(cropSeries.map((row) => row.municipality))].sort((a, b) => a.localeCompare(b, 'es')).map((municipality) => {
      const rows = cropSeries.filter((row) => row.municipality === municipality).sort((a, b) => a.year - b.year);
      const y24 = rows.find((row) => row.year === 2024) || null;
      const y25 = rows.find((row) => row.year === 2025) || null;
      return {
        municipality,
        series: rows,
        value2025: y25?.valueM ?? null,
        value2024: y24?.valueM ?? null,
        delta: y24 && y25 ? y25.valueM - y24.valueM : null,
        changePct: y24 && y25 && y24.valueM > 0 ? ((y25.valueM / y24.valueM) - 1) * 100 : null,
        detail2025: detail2025.filter((row) => row.Nommunicipio === municipality)
      };
    }).filter((row) => row.series.length);

    const municipalities2025 = byMunicipality.filter((row) => Number.isFinite(row.value2025)).sort((a, b) => b.value2025 - a.value2025);
    const gains = byMunicipality.filter((row) => Number.isFinite(row.delta) && row.delta > 0).sort((a, b) => b.delta - a.delta);
    const losses = byMunicipality.filter((row) => Number.isFinite(row.delta) && row.delta < 0).sort((a, b) => a.delta - b.delta);

    return {
      name,
      annual,
      detail2025,
      value2025: annual.find((row) => row.year === 2025)?.valueM ?? null,
      value2024: annual.find((row) => row.year === 2024)?.valueM ?? null,
      yearsReported: annual.length,
      municipalities2025,
      varieties,
      modalities,
      cycles,
      technologies,
      productionTypes,
      markets,
      byMunicipality,
      leaderMunicipality: municipalities2025[0] || null,
      gains,
      losses,
      topVariety: varieties[0] || null,
      units: unique(detail2025, 'Nomunidad')
    };
  }

  function aggregateBy(rows, key) {
    const buckets = new Map();
    rows.forEach((row) => {
      const label = row[key] || 'Sin clasificar';
      if (!buckets.has(label)) {
        buckets.set(label, {key: label, valueM: 0, planted: 0, harvest: 0, loss: 0, count: 0});
      }
      const bucket = buckets.get(label);
      bucket.valueM += n(row.valueM ?? (row.Valorproduccion / 1000));
      bucket.planted += n(row.Sembrada ?? row.planted);
      bucket.harvest += n(row.Cosechada ?? row.harvest);
      bucket.loss += n(row.Siniestrada ?? row.loss);
      bucket.count += 1;
    });
    const totalValue = [...buckets.values()].reduce((acc, row) => acc + row.valueM, 0);
    return [...buckets.values()].map((row) => ({
      ...row,
      share: totalValue > 0 ? (row.valueM / totalValue) * 100 : null
    })).sort((a, b) => b.valueM - a.valueM || a.key.localeCompare(b.key, 'es'));
  }

  function hhiFromRows(rows) {
    const totalValue = rows.reduce((acc, row) => acc + n(row.valueM), 0);
    if (!totalValue) return null;
    return rows.reduce((acc, row) => {
      const share = row.valueM / totalValue;
      return acc + share * share;
    }, 0);
  }

  function setView(view) {
    UI.view = view;
    document.querySelectorAll('.nav-pill').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
    document.querySelectorAll('.view-section').forEach((section) => {
      section.hidden = section.id !== `view-${view}`;
    });
  }

  function renderKpis(node, items) {
    clear(node);
    items.forEach((item) => {
      const article = document.createElement('article');
      article.className = 'kpi';
      article.innerHTML = `
        <div class="kpi-head">
          <div>
            <div class="kpi-name">${item.name}</div>
            <div class="kpi-unit">${item.unit || ''}</div>
          </div>
          ${item.badge ? `<span class="chip ${item.badgeClass || ''}">${item.badge}</span>` : ''}
        </div>
        <strong class="kpi-value ${item.valueClass || ''}">${item.value}</strong>
        <p class="kpi-foot">${item.description || ''}</p>
      `;
      node.append(article);
    });
  }

  function renderBullets(node, rows) {
    clear(node);
    rows.forEach((row) => {
      const div = document.createElement('div');
      div.className = row.type === 'headline' ? 'headline-item' : 'bullet-item';
      div.innerHTML = `<strong>${row.title}</strong><span>${row.text}</span>`;
      node.append(div);
    });
  }

  function renderBarList(node, items, {label = 'valueM', limit = 10, extra = null} = {}) {
    clear(node);
    const rows = items.slice(0, limit);
    if (!rows.length) {
      node.innerHTML = '<div class="empty-state">No hay datos disponibles para esta selección.</div>';
      return;
    }
    const max = Math.max(...rows.map((row) => row[label] || 0), 1);
    rows.forEach((row) => {
      const article = document.createElement('div');
      article.className = 'bar-item';
      const width = ((row[label] || 0) / max) * 100;
      const footer = typeof extra === 'function' ? extra(row) : null;
      article.innerHTML = `
        <div class="bar-head">
          <span class="bar-name">${row.name || row.key || row.crop || row.municipality}</span>
          <span class="bar-value">${millions(row[label])} MDP</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${width.toFixed(2)}%"></div></div>
        <div class="bar-foot">
          <span>${Number.isFinite(row.share) ? `${pct(row.share)} del subtotal` : '&nbsp;'}</span>
          <span>${footer || ''}</span>
        </div>
      `;
      node.append(article);
    });
  }

  function buildLinePath(data, getX, getY, width, height, padding) {
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const xs = data.map(getX);
    const ys = data.map(getY);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const scaleX = (value) => padding.left + ((value - minX) / Math.max(maxX - minX, 1)) * innerW;
    const scaleY = (value) => padding.top + innerH - ((value - minY) / Math.max(maxY - minY || 1, 1)) * innerH;
    const points = data.map((item) => `${scaleX(getX(item)).toFixed(2)},${scaleY(getY(item)).toFixed(2)}`).join(' ');
    return {points, scaleX, scaleY, minY, maxY, minX, maxX};
  }

  function renderDualChart(node, rows, config) {
    clear(node);
    if (!rows.length) {
      node.innerHTML = '<div class="empty-state">No existen datos para construir la gráfica.</div>';
      return;
    }
    const width = 820;
    const height = 320;
    const padding = {top: 12, right: 16, bottom: 28, left: 16};
    const valuePath = buildLinePath(rows, config.x, config.primary, width, height, padding);
    const secondaryPath = buildLinePath(rows, config.x, config.secondary, width, height, padding);
    const areaBase = height - padding.bottom;
    const areaPath = `${valuePath.points} ${valuePath.scaleX(config.x(rows[rows.length - 1]))},${areaBase} ${valuePath.scaleX(config.x(rows[0]))},${areaBase}`;

    const axisLabels = config.axisLabels || [config.x(rows[0]), config.x(rows[rows.length - 1])];
    node.innerHTML = `
      <div class="chart-shell">
        <div class="chart-legend">
          <span><i class="chart-dot" style="background:var(--brand-2)"></i>${config.primaryLabel}</span>
          <span><i class="chart-dot" style="background:var(--gold)"></i>${config.secondaryLabel}</span>
        </div>
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}" aria-label="${config.aria || 'gráfica'}">
          <defs>
            <linearGradient id="area-fill-${config.slug}" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="rgba(24,75,99,.20)"></stop>
              <stop offset="100%" stop-color="rgba(24,75,99,.03)"></stop>
            </linearGradient>
          </defs>
          <line x1="${padding.left}" y1="${areaBase}" x2="${width - padding.right}" y2="${areaBase}" stroke="#d9e1e8" stroke-width="1" />
          <path d="M ${areaPath}" fill="url(#area-fill-${config.slug})" opacity="1"></path>
          <polyline fill="none" stroke="var(--brand-2)" stroke-width="3" points="${valuePath.points}"></polyline>
          <polyline fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-dasharray="6 5" points="${secondaryPath.points}"></polyline>
          ${rows.map((row) => `<circle cx="${valuePath.scaleX(config.x(row)).toFixed(2)}" cy="${valuePath.scaleY(config.primary(row)).toFixed(2)}" r="3.2" fill="var(--brand-2)"></circle>`).join('')}
        </svg>
        <div class="axis-labels"><span>${axisLabels[0]}</span><span>${axisLabels[1]}</span></div>
      </div>
    `;
  }

  function renderSimpleLine(node, rows, config) {
    clear(node);
    if (!rows.length) {
      node.innerHTML = '<div class="empty-state">No existen datos para construir la gráfica.</div>';
      return;
    }
    const width = 820;
    const height = 320;
    const padding = {top: 12, right: 16, bottom: 28, left: 16};
    const primaryPath = buildLinePath(rows, config.x, config.y, width, height, padding);
    node.innerHTML = `
      <div class="chart-shell">
        <div class="chart-legend">
          <span><i class="chart-dot" style="background:var(--brand-2)"></i>${config.label}</span>
        </div>
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}" aria-label="${config.aria || 'gráfica'}">
          <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#d9e1e8" stroke-width="1" />
          <polyline fill="none" stroke="var(--brand-2)" stroke-width="3" points="${primaryPath.points}"></polyline>
          ${rows.map((row) => `<circle cx="${primaryPath.scaleX(config.x(row)).toFixed(2)}" cy="${primaryPath.scaleY(config.y(row)).toFixed(2)}" r="3.2" fill="var(--brand-2)"></circle>`).join('')}
        </svg>
        <div class="axis-labels"><span>${config.x(rows[0])}</span><span>${config.x(rows[rows.length - 1])}</span></div>
      </div>
    `;
  }

  function renderMiniMetrics(node, metrics) {
    clear(node);
    const wrap = document.createElement('div');
    wrap.className = 'metric-list';
    metrics.forEach((item) => {
      const box = document.createElement('div');
      box.className = 'metric-inline';
      box.innerHTML = `<small>${item.label}</small><strong>${item.value}</strong>`;
      wrap.append(box);
    });
    node.append(wrap);
  }

  function renderTable(node, headers, rows, numericColumns = []) {
    clear(node);
    if (!rows.length) {
      node.innerHTML = '<div class="empty-state">No hay registros para mostrar.</div>';
      return;
    }
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    headers.forEach((header, index) => {
      const th = document.createElement('th');
      th.textContent = header;
      if (numericColumns.includes(index)) th.className = 'numeric';
      trHead.append(th);
    });
    thead.append(trHead);
    table.append(thead);
    const tbody = document.createElement('tbody');
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell, index) => {
        const td = document.createElement('td');
        td.innerHTML = cell;
        if (numericColumns.includes(index)) td.className = 'numeric';
        tr.append(td);
      });
      tbody.append(tr);
    });
    table.append(tbody);
    node.append(table);
  }

  function makeDisclosure({title, sub, chips = [], body, open = false}) {
    const details = document.createElement('details');
    details.className = 'disclosure';
    if (open) details.open = true;
    const summary = document.createElement('summary');
    summary.innerHTML = `
      <div class="summary-main">
        <span class="summary-title">${title}</span>
        <span class="summary-sub">${sub || ''}</span>
      </div>
      <div class="summary-aside">
        ${chips.map((chip) => `<span class="chip ${chip.className || ''}">${chip.text}</span>`).join('')}
        <span class="chevron">›</span>
      </div>
    `;
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'disclosure-body';
    if (typeof body === 'function') body(bodyDiv);
    else if (body instanceof Node) bodyDiv.append(body);
    else bodyDiv.innerHTML = body;
    details.append(summary, bodyDiv);
    return details;
  }

  function overviewHeadlines() {
    const latest = DATA.state[DATA.state.length - 1];
    const previous = DATA.state[DATA.state.length - 2];
    const topCrops = aggregateBy(DATA.records2025, 'Nomcultivo');
    const topMunicipalities = DATA.municipal2025.slice().sort((a, b) => b.valueM - a.valueM);
    return [
      {
        title: `El valor agrícola estatal cerró en ${millions(latest.valueM)} MDP en 2025`,
        text: `Frente a 2024, la variación nominal fue ${pct(((latest.valueM / previous.valueM) - 1) * 100)}. La lectura debe tratarse como valor bruto corriente, no como valor real ni utilidad.`
      },
      {
        title: `Los tres principales cultivos concentran ${pct(topCrops.slice(0, 3).reduce((acc, row) => acc + (row.share || 0), 0))} del valor reportado en 2025`,
        text: `Maíz grano, chile verde y frijol aparecen al frente del cierre estatal.`
      },
      {
        title: `Culiacán, Guasave y Ahome concentran ${pct(topMunicipalities.slice(0, 3).reduce((acc, row) => acc + row.valueM, 0) / latest.valueM * 100)}`,
        text: `La concentración territorial se mide sobre valor bruto nominal y no implica, por sí misma, un juicio sobre rentabilidad o productividad causal.`
      }
    ];
  }

  function renderOverview() {
    const latest = DATA.state[DATA.state.length - 1];
    const previous = DATA.state[DATA.state.length - 2];
    renderBullets($('overview-headlines'), overviewHeadlines().map((row) => ({...row, type: 'headline'})));
    renderBullets($('overview-trace'), [
      {title: 'Paquete cargado', text: DATA.meta.title},
      {title: 'Cobertura', text: '23 años estatales, 18 municipios históricos y 8,217 series municipio–cultivo–año.'},
      {title: 'Detalle 2025', text: '637 observaciones originales con variables de variedad, modalidad, ciclo, tecnología, tipo de producción y mercado.'}
    ]);

    renderKpis($('state-kpis'), [
      {name: 'Valor agrícola 2025', unit: 'millones MXN corrientes', value: `${millions(latest.valueM)} MDP`, badge: pct(((latest.valueM / previous.valueM) - 1) * 100), badgeClass: ((latest.valueM / previous.valueM) - 1) >= 0 ? 'badge-up' : 'badge-down', description: 'Comparación nominal frente a 2024.'},
      {name: 'Superficie cosechada', unit: 'hectáreas reportadas', value: `${integer(latest.harvest)} ha`, description: 'Suma de cultivos y ciclos; no es superficie física única.'},
      {name: 'Municipios en la serie', unit: 'claves históricas', value: integer(DATA.audit.municipios), description: 'La fuente mantiene 18 claves históricas sin reasignación automática a demarcaciones recientes.'},
      {name: 'Registros del cierre 2025', unit: 'filas originales', value: integer(DATA.records2025.length), description: 'Observaciones individuales del cierre con dimensiones adicionales.'}
    ]);

    renderDualChart($('state-value-chart'), DATA.state, {
      x: (row) => row.year,
      primary: (row) => row.valueM,
      secondary: (row) => row.harvest / 1000,
      primaryLabel: 'Valor nominal (MDP)',
      secondaryLabel: 'Cosechada (miles de ha)',
      slug: 'state-value',
      aria: 'Valor agrícola estatal y superficie cosechada'
    });

    renderBarList($('state-top-crops'), aggregateBy(DATA.records2025, 'Nomcultivo'), {limit: 10, extra: (row) => `${pct(row.share)} del total estatal`});

    const grid = clear($('state-municipality-grid'));
    const municipalityCards = DATA.municipalities.map((name) => DATA.municipalityMap[name]).sort((a, b) => b.totalValue2025 - a.totalValue2025);
    municipalityCards.forEach((profile) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'territory-card';
      card.innerHTML = `
        <div class="territory-head">
          <div>
            <h4>${profile.name}</h4>
            <span class="chip ${profile.changePct >= 0 ? 'badge-up' : 'badge-down'}">${Number.isFinite(profile.changePct) ? pct(profile.changePct) : 'Sin comparación'}</span>
          </div>
          <span class="meta-pill">${profile.cropCount2025} cultivos</span>
        </div>
        <div class="territory-value">${millions(profile.totalValue2025)} MDP</div>
        <div class="territory-meta">
          <span class="meta-pill">Líder: ${profile.leader ? profile.leader.crop : 'n/d'}</span>
          <span class="meta-pill">Top 3: ${pct(profile.topShare)}</span>
          <span class="meta-pill">${concentrationLabel(profile.hhi)}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        UI.municipality = profile.name;
        $('municipality-select').value = profile.name;
        renderMunicipality();
        setView('municipality');
      });
      grid.append(card);
    });

    renderBullets($('overview-alerts'), [
      {title: 'Valores nominales', text: 'Las comparaciones monetarias se expresan en pesos corrientes; no equivalen a variaciones reales ni a márgenes de utilidad.'},
      {title: 'Superficie no aditiva', text: 'La suma de sembrada, cosechada o siniestrada acumula cultivos y ciclos, por lo que no representa una superficie física única.'},
      {title: 'Detalle 2025', text: 'Las dimensiones de variedad, modalidad, ciclo y tecnología están disponibles para el cierre 2025; no deben extrapolarse como serie histórica completa.'},
      {title: 'Cobertura y anomalías', text: 'Deben mantenerse visibles la caída del número de cultivos en 2020–2021 y la cifra atípica de superficie siniestrada reportada para 2025.'}
    ]);
  }

  function municipalityConclusions(profile) {
    const bullets = [];
    const direction = Number.isFinite(profile.changePct) ? (profile.changePct >= 0 ? 'creció' : 'retrocedió') : 'no tiene comparación';
    bullets.push({
      title: 'Balance municipal',
      text: `${profile.name} ${direction} frente a 2024 y cerró 2025 con ${millions(profile.totalValue2025)} MDP. ${Number.isFinite(profile.changePct) ? `La variación nominal fue ${pct(profile.changePct)}.` : 'No existe una base comparable suficiente.'}`
    });
    if (profile.leader) {
      bullets.push({
        title: 'Cultivo líder',
        text: `${profile.leader.crop} encabezó el valor municipal con ${millions(profile.leader.value2025)} MDP y una participación de ${pct(profile.leader.share2025)} dentro del subtotal de 2025.`
      });
    }
    if (profile.positive[0] || profile.negative[0]) {
      const pos = profile.positive[0];
      const neg = profile.negative[0];
      bullets.push({
        title: 'Ganancias y retrocesos comparables',
        text: `${pos ? `El mayor aumento comparable se observó en ${pos.crop} (${signed(pos.delta)} MDP).` : 'No hubo aumentos comparables.'} ${neg ? `La mayor caída comparable correspondió a ${neg.crop} (${signed(neg.delta)} MDP).` : 'No hubo caídas comparables.'}`
      });
    }
    bullets.push({
      title: 'Concentración productiva',
      text: `El HHI estimado sugiere ${concentrationLabel(profile.hhi)} y los tres cultivos principales explican ${pct(profile.topShare)} del valor municipal de 2025.`
    });
    if (profile.notReported2025.length || profile.newlyReported2025.length) {
      bullets.push({
        title: 'Presencia y ausencias en 2025',
        text: `${profile.newlyReported2025.length ? `${profile.newlyReported2025.length} cultivos aparecen en 2025 sin registro comparable en 2024.` : 'No hay cultivos nuevos reportados en 2025.'} ${profile.notReported2025.length ? `${profile.notReported2025.length} cultivos con presencia en 2024 no aparecen en el cierre 2025 y no deben tratarse automáticamente como producción cero.` : ''}`
      });
    }
    bullets.push({
      title: 'Advertencia de interpretación',
      text: 'Las conclusiones son descriptivas. Las descomposiciones por superficie, rendimiento y precio implícito ayudan a leer cambios contables, pero no identifican causalidad por sí solas.'
    });
    return bullets;
  }

  function renderMunicipality() {
    const profile = DATA.municipalityMap[UI.municipality];
    $('municipality-title').textContent = profile.name;
    $('municipality-subtitle').textContent = 'Resumen del cierre agrícola, concentración del valor y evolución histórica del municipio.';
    $('municipality-top-share').textContent = `Top 3: ${pct(profile.topShare)}`;
    $('municipality-report-ref').textContent = profile.reportPages ? `Informe: perfil p. ${profile.reportPages[0]} · cierre desde p. ${profile.reportPages[1]}` : 'Sin referencia de página';

    renderKpis($('municipality-kpis'), [
      {name: 'Valor 2025', unit: 'millones MXN corrientes', value: `${millions(profile.totalValue2025)} MDP`, badge: Number.isFinite(profile.changePct) ? pct(profile.changePct) : 'Sin comparación', badgeClass: Number.isFinite(profile.changePct) ? (profile.changePct >= 0 ? 'badge-up' : 'badge-down') : 'badge-neutral', description: 'Valor bruto nominal del municipio en 2025.'},
      {name: 'Cultivos reportados', unit: 'cierre 2025', value: integer(profile.cropCount2025), description: 'Conteo de cultivos observados en el detalle de 2025.'},
      {name: 'Superficie cosechada', unit: 'hectáreas reportadas', value: `${integer(profile.totalHarvest2025)} ha`, description: 'Suma observada en 2025 para el municipio.'},
      {name: 'HHI del valor', unit: '0 a 1', value: Number.isFinite(profile.hhi) ? profile.hhi.toFixed(3) : 'n/d', description: `Lectura sugerida: ${concentrationLabel(profile.hhi)}.`}
    ]);

    const summaryNode = clear($('municipality-accordion-summary'));
    municipalityConclusions(profile).forEach((row, index) => {
      summaryNode.append(makeDisclosure({
        title: row.title,
        sub: row.text.slice(0, 120) + (row.text.length > 120 ? '…' : ''),
        body: `<p>${row.text}</p>`,
        open: index === 0
      }));
    });

    renderDualChart($('municipality-chart'), profile.annual, {
      x: (row) => row.year,
      primary: (row) => row.valueM,
      secondary: (row) => row.harvest / 1000,
      primaryLabel: 'Valor nominal (MDP)',
      secondaryLabel: 'Cosechada (miles de ha)',
      slug: `mun-${slug(profile.name)}`,
      aria: `Serie histórica de ${profile.name}`
    });

    renderBarList($('municipality-top-crops'), profile.topCrops.map((row) => ({...row, name: row.crop, valueM: row.value2025, share: row.share2025})), {limit: 10, extra: (row) => Number.isFinite(row.delta) ? `${signed(row.delta)} MDP vs 2024` : 'Sin comparación'});

    const detailNode = clear($('municipality-crop-details'));
    profile.topCrops.forEach((item, index) => {
      detailNode.append(makeCropDisclosure(item, index === 0));
    });
  }

  function makeCropDisclosure(item, open) {
    return makeDisclosure({
      title: item.crop,
      sub: `${item.reported2025 && Number.isFinite(item.value2025) ? `${millions(item.value2025)} MDP en 2025` : 'Sin observación 2025'}${Number.isFinite(item.share2025) ? ` · ${pct(item.share2025)} del subtotal municipal` : ''}`,
      chips: [
        {text: item.reported2024 && item.reported2025 && Number.isFinite(item.delta) ? `${signed(item.delta)} MDP` : 'Sin comparación', className: Number.isFinite(item.delta) ? (item.delta >= 0 ? 'badge-up' : 'badge-down') : 'badge-neutral'},
        {text: item.unit || 'Unidad n/d'}
      ],
      open,
      body: (body) => {
        const grid = document.createElement('div');
        grid.className = 'disclosure-grid';
        const left = document.createElement('div');
        const right = document.createElement('div');

        const chart = document.createElement('div');
        chart.className = 'chart-card';
        renderSimpleLine(chart, item.series, {
          x: (row) => row.year,
          y: (row) => row.valueM,
          label: 'Valor del cultivo (MDP)',
          aria: `Serie histórica de ${item.crop}`
        });
        left.append(chart);

        const metrics = document.createElement('div');
        renderMiniMetrics(metrics, [
          {label: '2025', value: item.reported2025 ? `${millions(item.value2025)} MDP` : 'Sin reporte'},
          {label: '2024', value: item.reported2024 ? `${millions(item.value2024)} MDP` : 'Sin reporte'},
          {label: 'Variación', value: Number.isFinite(item.changePct) ? pct(item.changePct) : 'Sin comparación'},
          {label: 'Participación 2025', value: Number.isFinite(item.share2025) ? pct(item.share2025) : 'n/d'}
        ]);
        right.append(metrics);

        const notes = document.createElement('div');
        notes.className = 'copy-list';
        const composition = {
          variedades: aggregateBy(item.detail2025, 'Nomvariedad').slice(0, 3),
          modalidades: aggregateBy(item.detail2025, 'Nommodalidad').slice(0, 3),
          ciclos: aggregateBy(item.detail2025, 'Nomcicloproductivo').slice(0, 3)
        };
        const topVariety = composition.variedades[0];
        const topMode = composition.modalidades[0];
        const topCycle = composition.ciclos[0];
        const compareText = Number.isFinite(item.delta)
          ? `El cambio nominal 2024–2025 fue ${signed(item.delta)} MDP (${pct(item.changePct)}).`
          : 'No existe una comparación válida entre 2024 y 2025 porque falta al menos una observación.';
        notes.innerHTML = `
          <p><strong>Lectura rápida.</strong> ${compareText}</p>
          <p><strong>Composición 2025.</strong> ${topVariety ? `La variedad con mayor valor fue ${topVariety.key} (${millions(topVariety.valueM)} MDP).` : 'No se encontraron variedades desagregadas.'} ${topMode ? `La modalidad dominante fue ${topMode.key}.` : ''} ${topCycle ? `El ciclo con mayor valor fue ${topCycle.key}.` : ''}</p>
          <p><strong>Cautela.</strong> Si el cultivo no aparece en uno de los años, la ausencia no se imputa como producción cero.</p>
        `;
        right.append(notes);

        grid.append(left, right);
        body.append(grid);

        if (item.detail2025.length) {
          const chips = document.createElement('div');
          chips.className = 'data-chip-wrap';
          ['Nomvariedad', 'Nommodalidad', 'Nomcicloproductivo', 'TipoTecnologia', 'TipoMercado'].forEach((field) => {
            const top = aggregateBy(item.detail2025, field)[0];
            if (top) {
              const span = document.createElement('span');
              span.className = 'meta-pill';
              span.textContent = `${field.replace('Nom', '').replace('Tipo', '')}: ${top.key}`;
              chips.append(span);
            }
          });
          body.append(chips);
        }
      }
    });
  }

  function cropConclusions(profile) {
    const bullets = [];
    bullets.push({
      title: 'Escala del cultivo',
      text: `${profile.name} acumuló ${millions(profile.value2025)} MDP en 2025 y aparece reportado en ${profile.yearsReported} años de la serie. Los años ausentes se mantienen como ausencias y no como ceros.`
    });
    if (profile.leaderMunicipality) {
      bullets.push({
        title: 'Municipio líder',
        text: `${profile.leaderMunicipality.municipality} lideró el valor del cultivo en 2025 con ${millions(profile.leaderMunicipality.value2025)} MDP.`
      });
    }
    if (profile.topVariety) {
      bullets.push({
        title: 'Variedad de mayor valor en 2025',
        text: `${profile.topVariety.key} encabezó la estructura del cultivo con ${millions(profile.topVariety.valueM)} MDP, equivalente a ${pct(profile.topVariety.share)} del subtotal del cultivo en el cierre 2025.`
      });
    }
    if (profile.gains[0] || profile.losses[0]) {
      bullets.push({
        title: 'Cambios territoriales comparables',
        text: `${profile.gains[0] ? `El mayor aumento comparable entre municipios fue en ${profile.gains[0].municipality} (${signed(profile.gains[0].delta)} MDP).` : 'No hubo aumentos comparables.'} ${profile.losses[0] ? `La mayor contracción comparable ocurrió en ${profile.losses[0].municipality} (${signed(profile.losses[0].delta)} MDP).` : 'No hubo caídas comparables.'}`
      });
    }
    bullets.push({
      title: 'Advertencia de lectura',
      text: 'Las dimensiones de modalidad, tecnología, tipo de producción y mercado mostradas aquí provienen del cierre 2025; describen esa fotografía anual y no sustituyen un seguimiento histórico completo.'
    });
    return bullets;
  }

  function renderCrops() {
    const profile = DATA.cropMap[UI.crop];
    $('crop-title').textContent = profile.name;
    $('crop-subtitle').textContent = 'Trayectoria agregada del cultivo, distribución municipal y dimensiones observadas en 2025.';

    const changePctValue = Number.isFinite(profile.value2024) && profile.value2024 > 0 ? ((profile.value2025 / profile.value2024) - 1) * 100 : null;
    renderKpis($('crop-kpis'), [
      {name: 'Valor 2025', unit: 'millones MXN corrientes', value: `${millions(profile.value2025)} MDP`, badge: Number.isFinite(changePctValue) ? pct(changePctValue) : 'Sin comparación', badgeClass: Number.isFinite(changePctValue) ? (changePctValue >= 0 ? 'badge-up' : 'badge-down') : 'badge-neutral', description: 'Subtotal del cultivo en 2025.'},
      {name: 'Años reportados', unit: 'serie 2003–2025', value: integer(profile.yearsReported), description: 'Presencia en la serie histórica consolidada.'},
      {name: 'Municipios con presencia 2025', unit: 'detalle del cierre', value: integer(profile.municipalities2025.length), description: 'Municipios que reportaron el cultivo en 2025.'},
      {name: 'Variedades observadas 2025', unit: 'cierre 2025', value: integer(profile.varieties.length), description: 'Etiquetas de variedad observadas en el cierre del cultivo.'}
    ]);

    const conclusionsNode = clear($('crop-conclusions'));
    cropConclusions(profile).forEach((row, index) => {
      conclusionsNode.append(makeDisclosure({
        title: row.title,
        sub: row.text.slice(0, 120) + (row.text.length > 120 ? '…' : ''),
        body: `<p>${row.text}</p>`,
        open: index === 0
      }));
    });

    renderSimpleLine($('crop-chart'), profile.annual, {
      x: (row) => row.year,
      y: (row) => row.valueM,
      label: 'Valor estatal del cultivo (MDP)',
      aria: `Serie histórica de ${profile.name}`
    });

    renderBarList($('crop-municipality-bars'), profile.municipalities2025.map((row) => ({...row, name: row.municipality, valueM: row.value2025, share: profile.value2025 > 0 ? (row.value2025 / profile.value2025) * 100 : null})), {limit: 10, extra: (row) => Number.isFinite(row.delta) ? `${signed(row.delta)} MDP vs 2024` : 'Sin comparación'});

    const detailNode = clear($('crop-dimension-details'));
    const sections = [
      ['Variedades 2025', profile.varieties, 'Variedad'],
      ['Modalidades 2025', profile.modalities, 'Modalidad'],
      ['Ciclos 2025', profile.cycles, 'Ciclo'],
      ['Tecnologías 2025', profile.technologies, 'Tecnología'],
      ['Tipo de producción 2025', profile.productionTypes, 'Tipo'],
      ['Mercados 2025', profile.markets, 'Mercado'],
      ['Municipios con serie individual', profile.byMunicipality.sort((a, b) => (b.value2025 || -1) - (a.value2025 || -1)).slice(0, 12), 'Municipio']
    ];

    sections.forEach(([title, rows, label], index) => {
      detailNode.append(makeDisclosure({
        title,
        sub: title === 'Municipios con serie individual' ? 'Abre para ver series municipales y comparación 2024–2025.' : `Distribución observada del cultivo por ${label.toLowerCase()} en el cierre 2025.`,
        open: index === 0,
        chips: [{text: integer(rows.length)}],
        body: (body) => {
          if (title === 'Municipios con serie individual') {
            if (!rows.length) {
              body.innerHTML = '<div class="empty-state">No hay municipios con presencia para este cultivo.</div>';
              return;
            }
            rows.forEach((row) => {
              body.append(makeDisclosure({
                title: row.municipality,
                sub: row.value2025 != null ? `${millions(row.value2025)} MDP en 2025` : 'Sin observación 2025',
                chips: [{text: Number.isFinite(row.changePct) ? pct(row.changePct) : 'Sin comparación', className: Number.isFinite(row.changePct) ? (row.changePct >= 0 ? 'badge-up' : 'badge-down') : 'badge-neutral'}],
                body: (inner) => {
                  const grid = document.createElement('div');
                  grid.className = 'disclosure-grid';
                  const left = document.createElement('div');
                  const right = document.createElement('div');
                  const chart = document.createElement('div');
                  chart.className = 'chart-card';
                  renderSimpleLine(chart, row.series, {x: (r) => r.year, y: (r) => r.valueM, label: 'Valor municipal del cultivo (MDP)'});
                  left.append(chart);
                  const metrics = document.createElement('div');
                  renderMiniMetrics(metrics, [
                    {label: '2025', value: row.value2025 != null ? `${millions(row.value2025)} MDP` : 'Sin reporte'},
                    {label: '2024', value: row.value2024 != null ? `${millions(row.value2024)} MDP` : 'Sin reporte'},
                    {label: 'Variación', value: Number.isFinite(row.changePct) ? pct(row.changePct) : 'Sin comparación'},
                    {label: 'Registros detalle 2025', value: integer(row.detail2025.length)}
                  ]);
                  right.append(metrics);
                  grid.append(left, right);
                  inner.append(grid);
                }
              }));
            });
            return;
          }
          renderBarList(body, rows.map((row) => ({...row, name: row.key, valueM: row.valueM, share: row.share})), {limit: 15, extra: (row) => `${integer(row.count)} registros`});
        }
      }));
    });
  }

  function renderQuality() {
    renderKpis($('quality-kpis'), [
      {name: 'Filas auditadas', unit: 'declaradas por el paquete', value: integer(DATA.audit.filas), description: 'Población reportada por la auditoría incorporada.'},
      {name: 'Variables', unit: 'esquema auditado', value: integer(DATA.audit.variables), description: 'Número de variables declaradas por el paquete.'},
      {name: 'Duplicados exactos', unit: 'conteo reportado', value: integer(DATA.audit.duplicados_exactos), description: 'Resultado reportado en el paquete de auditoría.'},
      {name: 'Cosechada > sembrada', unit: 'conteo reportado', value: integer(DATA.audit.cosechada_supera_sembrada), description: 'Control de consistencia declarado por el paquete.'}
    ]);

    renderBullets($('quality-source'), [
      {title: 'Fuente cargada', text: DATA.meta.source},
      {title: 'Cobertura temporal', text: DATA.meta.period},
      {title: 'Unidad monetaria', text: DATA.meta.value_unit},
      {title: 'Hash de referencia', text: DATA.meta.source_checksum_from_audit || 'Disponible en la auditoría incorporada.'}
    ]);

    renderBullets($('quality-alerts'), [
      {title: 'Valores no deflactados', text: 'El valor monetario no está ajustado por inflación, por lo que no representa variaciones reales.'},
      {title: 'Superficie acumulada', text: 'La plataforma suma cultivos y ciclos; no debe interpretarse como superficie agrícola física única.'},
      {title: 'Ausencia no es cero', text: 'Las faltas de registro en un año no se imputan automáticamente como ausencia de producción.'},
      {title: '2025 como foto detallada', text: 'Variedades, mercado, modalidad y tecnología se muestran como dimensiones del cierre 2025 y no como historia completa del periodo.'}
    ]);

    renderTable($('quality-audit-table'), ['Indicador', 'Valor'], [
      ['Municipios históricos', integer(DATA.audit.municipios)],
      ['Años cubiertos', integer(DATA.audit.anios)],
      ['Nulos reportados', integer(DATA.audit.nulos)],
      ['Duplicados exactos', integer(DATA.audit.duplicados_exactos)],
      ['Duplicados por clave', integer(DATA.audit.duplicados_clave)],
      ['Cosechada > sembrada', integer(DATA.audit.cosechada_supera_sembrada)],
      ['Desviación >1 % del valor', integer(DATA.audit.valor_desviacion_superior_1pct)],
      ['Desviación de rendimiento >0.0025', integer(DATA.audit.rendimiento_desviacion_superior_0025)],
      ['No tonelada', integer(DATA.audit.no_toneladas)]
    ], [1]);

    const guidance = clear($('quality-guidance'));
    [
      {
        title: 'Qué sí puede leerse aquí',
        text: 'Tendencias históricas del valor bruto, composición 2025, comparaciones nominales 2024–2025 y estructuras territoriales y productivas del cierre cargado.'
      },
      {
        title: 'Qué no debe afirmarse sin más evidencia',
        text: 'No debe inferirse causalidad climática, rentabilidad neta, eficiencia técnica o impactos de política solo con las series aquí mostradas.'
      },
      {
        title: 'Cómo se usan las conclusiones desplegables',
        text: 'Funcionan como un apoyo narrativo dentro de la página. Resumen las cifras del municipio o del cultivo, pero deben acompañarse con las advertencias y con la revisión del reporte completo.'
      },
      {
        title: 'Sobre el informe de más de 300 páginas',
        text: 'La plataforma utiliza sus anexos estadísticos y referencias de página, pero no reemplaza la revisión íntegra del documento PDF cuando se necesite detalle narrativo completo.'
      }
    ].forEach((row, index) => {
      guidance.append(makeDisclosure({title: row.title, sub: row.text.slice(0, 110) + (row.text.length > 110 ? '…' : ''), body: `<p>${row.text}</p>`, open: index === 0}));
    });
  }

  function bindControls() {
    document.querySelectorAll('.nav-pill').forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.view));
    });
    $('municipality-select').addEventListener('change', (event) => {
      UI.municipality = event.target.value;
      renderMunicipality();
    });
    $('crop-select').addEventListener('change', (event) => {
      UI.crop = event.target.value;
      renderCrops();
    });
    $('expand-municipality-crops').addEventListener('click', () => toggleAll('#municipality-crop-details details.disclosure', $('expand-municipality-crops')));
    $('expand-crop-dimensions').addEventListener('click', () => toggleAll('#crop-dimension-details > details.disclosure', $('expand-crop-dimensions')));
  }

  function toggleAll(selector, button) {
    const details = [...document.querySelectorAll(selector)];
    const shouldOpen = details.some((item) => !item.open);
    details.forEach((item) => { item.open = shouldOpen; });
    button.textContent = shouldOpen ? 'Contraer todo' : 'Expandir todo';
  }

  function slug(text) {
    return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function fillSelectors() {
    $('municipality-select').innerHTML = DATA.municipalities.map((name) => `<option value="${name}">${name}</option>`).join('');
    $('municipality-select').value = UI.municipality;
    $('crop-select').innerHTML = DATA.cropsIndex.map((name) => `<option value="${name}">${name}</option>`).join('');
    $('crop-select').value = UI.crop;
  }

  async function init() {
    try {
      $('load-indicator').textContent = 'Cargando datos auditados…';
      const raw = await decodePack();
      DATA = prepareData(raw);
      fillSelectors();
      bindControls();
      renderOverview();
      renderMunicipality();
      renderCrops();
      renderQuality();
      setView('overview');
      $('load-indicator').textContent = 'Datos auditados listos';
      showBanner('Interfaz renovada: ahora puedes revisar conclusiones desplegables y gráficas individuales por municipio y cultivo.');
    } catch (error) {
      console.error(error);
      $('load-indicator').textContent = 'Error de carga';
      showBanner(`No fue posible inicializar la plataforma: ${error.message}`);
    }
  }

  init();
})();
