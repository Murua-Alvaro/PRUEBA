'use strict';
(()=>{
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('es-MX',{maximumFractionDigits:1,minimumFractionDigits:1});
const fmt0=new Intl.NumberFormat('es-MX',{maximumFractionDigits:0});
const compact=new Intl.NumberFormat('es-MX',{notation:'compact',maximumFractionDigits:1});
const MX=v=>Number.isFinite(v)?fmt.format(v):'';
const INT=v=>Number.isFinite(v)?fmt0.format(v):'';
const PCT=v=>Number.isFinite(v)?`${fmt.format(v)} %`:'';
const DIF=v=>Number.isFinite(v)?`${v>0?'+':''}${fmt.format(v)}`:'';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Number(v)||0;
const sum=(arr,key)=>arr.reduce((s,x)=>s+num(x[key]),0);
const one=(t,name)=>t.rows.map(row=>Object.fromEntries(t.columns.map((key,i)=>[key,row[i]])));
const uniq=arr=>[...new Set(arr)];
const colour='#161616';
const state={tab:'panorama',municipio:'Mazatlán',cultivo:'Maíz grano',municipioMetric:'value',activeMunicipioCrop:null,search:'',order:'value'};
const REPORTS_EMBEDDED={"Ahome":{"profilePage":7,"reportPages":[32,33,34],"closing1":"Papa fue el principal generador de valor agrícola bruto en Ahome durante 2025, con 2.608,8 millones de pesos y 33,3 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Frijol (+570,5 millones de pesos respecto de 2024). En contraste, Maíz grano presentó la mayor reducción (−709,8 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Frijol, el valor varió +570,5 millones de pesos. La mayor contribución fue la de superficie (+845,9 millones), seguida de precio implícito (−195,8 millones). El tercer efecto aportó −79,6 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Maíz grano, el valor varió −709,8 millones de pesos. La mayor contribución fue la de superficie (−1.117,0 millones), seguida de precio implícito (+288,5 millones). El tercer efecto aportó +118,8 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Ahome (39,4 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Frijol (+17.925 ha). El mayor retroceso de superficie corresponde a Maíz grano (−19.307 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 61,8 % del valor agrícola municipal. Papa encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Angostura":{"profilePage":35,"reportPages":[53,54,55],"closing1":"Frijol fue el principal generador de valor agrícola bruto en Angostura durante 2025, con 549,6 millones de pesos y 32,1 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Frijol (+93,8 millones de pesos respecto de 2024). En contraste, Maíz grano presentó la mayor reducción (−1.001,5 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Frijol, el valor varió +93,8 millones de pesos. La mayor contribución fue la de rendimiento (+63,7 millones), seguida de superficie (+29,0 millones). El tercer efecto aportó +1,1 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Maíz grano, el valor varió −1.001,5 millones de pesos. La mayor contribución fue la de superficie (−1.118,0 millones), seguida de precio implícito (+301,0 millones). El tercer efecto aportó −184,5 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Angostura (52,7 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Frijol (+648 ha). El mayor retroceso de superficie corresponde a Maíz grano (−18.966 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 69,8 % del valor agrícola municipal. Frijol encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Badiraguato":{"profilePage":56,"reportPages":[69,70,71],"closing1":"Maíz grano fue el principal generador de valor agrícola bruto en Badiraguato durante 2025, con 42,3 millones de pesos y 62,9 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Maíz grano (+29,7 millones de pesos respecto de 2024). No se observó una disminución nominal entre los cultivos presentes en ambos años. Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Maíz grano, el valor varió +29,7 millones de pesos. La mayor contribución fue la de rendimiento (+21,8 millones), seguida de precio implícito (+7,3 millones). El tercer efecto aportó +0,6 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Sorgo forrajero en verde, el valor varió +12,8 millones de pesos. La mayor contribución fue la de superficie (+7,8 millones), seguida de rendimiento (+4,3 millones). El tercer efecto aportó +0,7 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Badiraguato (35,9 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Sorgo forrajero en verde. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Sorgo forrajero en verde (+990 ha). Tampoco se identifican contracciones comparables de superficie cosechada. Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 96,5 % del valor agrícola municipal. Maíz grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Choix":{"profilePage":72,"reportPages":[86,87,88],"closing1":"Cacahuate fue el principal generador de valor agrícola bruto en Choix durante 2025, con 135,6 millones de pesos y 31,3 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Cacahuate (+133,1 millones de pesos respecto de 2024). No se observó una disminución nominal entre los cultivos presentes en ambos años. Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Cacahuate, el valor varió +133,1 millones de pesos. La mayor contribución fue la de superficie (+60,3 millones), seguida de precio implícito (+56,6 millones). El tercer efecto aportó +16,2 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Ajonjolí, el valor varió +87,0 millones de pesos. La mayor contribución fue la de superficie (+53,0 millones), seguida de rendimiento (+35,2 millones). El tercer efecto aportó −1,2 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Ajonjolí presentó la mayor participación media en el valor agrícola registrado de Choix (38,6 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Pastos y praderas. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Ajonjolí (+4.250 ha). Tampoco se identifican contracciones comparables de superficie cosechada. Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 80,9 % del valor agrícola municipal. Cacahuate encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Concordia":{"profilePage":89,"reportPages":[107,108,109],"closing1":"Chile verde fue el principal generador de valor agrícola bruto en Concordia durante 2025, con 240,5 millones de pesos y 34,6 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Agave (+103,9 millones de pesos respecto de 2024). En contraste, Mango presentó la mayor reducción (−23,7 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Agave, el valor varió +103,9 millones de pesos. La mayor contribución fue la de rendimiento (+102,1 millones), seguida de precio implícito (+1,9 millones). El tercer efecto aportó 0,0 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Mango, el valor varió −23,7 millones de pesos. La mayor contribución fue la de precio implícito (−23,7 millones), seguida de superficie (+0,2 millones). El tercer efecto aportó −0,2 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Chile verde presentó la mayor participación media en el valor agrícola registrado de Concordia (28,5 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Pastos y praderas. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Chile verde (+200 ha). El mayor retroceso de superficie corresponde a Sorgo forrajero en verde (−111 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 69,8 % del valor agrícola municipal. Chile verde encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Cosalá":{"profilePage":110,"reportPages":[124,125,126],"closing1":"Maíz grano fue el principal generador de valor agrícola bruto en Cosalá durante 2025, con 71,2 millones de pesos y 49,9 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Sorgo grano (+64,3 millones de pesos respecto de 2024). En contraste, Naranja presentó la mayor reducción (−0,2 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Sorgo grano, el valor varió +64,3 millones de pesos. La mayor contribución fue la de superficie (+30,1 millones), seguida de rendimiento (+27,9 millones). El tercer efecto aportó +6,3 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Naranja, el valor varió −0,2 millones de pesos. La mayor contribución fue la de rendimiento (−0,2 millones), seguida de superficie (0,0 millones). El tercer efecto aportó 0,0 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Cosalá (44,3 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Pastos y praderas. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Maíz grano (+6.385 ha). Tampoco se identifican contracciones comparables de superficie cosechada. Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 99,0 % del valor agrícola municipal. Maíz grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Culiacán":{"profilePage":127,"reportPages":[152,153,154],"closing1":"Maíz grano fue el principal generador de valor agrícola bruto en Culiacán durante 2025, con 3.655,0 millones de pesos y 41,4 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Maíz grano (+754,6 millones de pesos respecto de 2024). En contraste, Tomate rojo (jitomate) presentó la mayor reducción (−1.201,1 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Maíz grano, el valor varió +754,6 millones de pesos. La mayor contribución fue la de precio implícito (+585,6 millones), seguida de superficie (+485,5 millones). El tercer efecto aportó −316,5 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Tomate rojo (jitomate), el valor varió −1.201,1 millones de pesos. La mayor contribución fue la de precio implícito (−950,2 millones), seguida de rendimiento (−337,2 millones). El tercer efecto aportó +86,3 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Culiacán (44,7 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Maíz grano (+8.507 ha). El mayor retroceso de superficie corresponde a Sorgo forrajero en verde (−1.836 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 70,1 % del valor agrícola municipal. Maíz grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"El Fuerte":{"profilePage":155,"reportPages":[176,177,178],"closing1":"Arándano fue el principal generador de valor agrícola bruto en El Fuerte durante 2025, con 622,4 millones de pesos y 31,3 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Arándano (+192,5 millones de pesos respecto de 2024). En contraste, Maíz grano presentó la mayor reducción (−99,0 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Arándano, el valor varió +192,5 millones de pesos. La mayor contribución fue la de precio implícito (+405,9 millones), seguida de rendimiento (−255,2 millones). El tercer efecto aportó +41,8 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Maíz grano, el valor varió −99,0 millones de pesos. La mayor contribución fue la de superficie (−148,6 millones), seguida de precio implícito (+84,3 millones). El tercer efecto aportó −34,7 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de El Fuerte (32,8 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Frijol (+1.010 ha). El mayor retroceso de superficie corresponde a Maíz grano (−2.309 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 60,5 % del valor agrícola municipal. Arándano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Elota":{"profilePage":179,"reportPages":[199,200,201],"closing1":"Chile verde fue el principal generador de valor agrícola bruto en Elota durante 2025, con 1.161,6 millones de pesos y 45,5 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Sorgo grano (+39,3 millones de pesos respecto de 2024). En contraste, Tomate rojo (jitomate) presentó la mayor reducción (−918,9 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Sorgo grano, el valor varió +39,3 millones de pesos. La mayor contribución fue la de rendimiento (+27,3 millones), seguida de superficie (+7,7 millones). El tercer efecto aportó +4,2 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Tomate rojo (jitomate), el valor varió −918,9 millones de pesos. La mayor contribución fue la de superficie (−636,3 millones), seguida de rendimiento (−159,5 millones). El tercer efecto aportó −123,0 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Tomate rojo (jitomate) presentó la mayor participación media en el valor agrícola registrado de Elota (30,7 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Sorgo grano (+568 ha). El mayor retroceso de superficie corresponde a Maíz grano (−4.189 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 89,4 % del valor agrícola municipal. Chile verde encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Escuinapa":{"profilePage":202,"reportPages":[218,219,220],"closing1":"Mango fue el principal generador de valor agrícola bruto en Escuinapa durante 2025, con 928,9 millones de pesos y 47,6 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Sandía (+13,2 millones de pesos respecto de 2024). En contraste, Chile verde presentó la mayor reducción (−1.215,0 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Sandía, el valor varió +13,2 millones de pesos. La mayor contribución fue la de precio implícito (+24,0 millones), seguida de rendimiento (−10,9 millones). El tercer efecto aportó 0,0 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Chile verde, el valor varió −1.215,0 millones de pesos. La mayor contribución fue la de superficie (−1.199,6 millones), seguida de rendimiento (−182,7 millones). El tercer efecto aportó +167,3 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Chile verde presentó la mayor participación media en el valor agrícola registrado de Escuinapa (51,0 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Chile verde. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Pepino (+15 ha). El mayor retroceso de superficie corresponde a Chile verde (−2.880 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 95,5 % del valor agrícola municipal. Mango encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Guasave":{"profilePage":221,"reportPages":[242,243,244],"closing1":"Maíz grano fue el principal generador de valor agrícola bruto en Guasave durante 2025, con 2.929,4 millones de pesos y 35,2 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Papa (+275,3 millones de pesos respecto de 2024). En contraste, Maíz grano presentó la mayor reducción (−1.018,3 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Papa, el valor varió +275,3 millones de pesos. La mayor contribución fue la de superficie (+614,4 millones), seguida de precio implícito (−391,4 millones). El tercer efecto aportó +52,2 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Maíz grano, el valor varió −1.018,3 millones de pesos. La mayor contribución fue la de superficie (−1.121,1 millones), seguida de precio implícito (+912,4 millones). El tercer efecto aportó −809,6 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Guasave (48,5 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Papa (+1.812 ha). El mayor retroceso de superficie corresponde a Maíz grano (−19.835 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 65,8 % del valor agrícola municipal. Maíz grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Mazatlán":{"profilePage":245,"reportPages":[263,264,265],"closing1":"Chile verde fue el principal generador de valor agrícola bruto en Mazatlán durante 2025, con 454,2 millones de pesos y 36,8 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Chile verde (+209,9 millones de pesos respecto de 2024). En contraste, Mango presentó la mayor reducción (−36,1 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Chile verde, el valor varió +209,9 millones de pesos. La mayor contribución fue la de superficie (+138,3 millones), seguida de precio implícito (+75,8 millones). El tercer efecto aportó −4,1 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Mango, el valor varió −36,1 millones de pesos. La mayor contribución fue la de precio implícito (−36,1 millones), seguida de rendimiento (−0,0 millones). El tercer efecto aportó 0,0 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Chile verde presentó la mayor participación media en el valor agrícola registrado de Mazatlán (34,9 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Sorgo forrajero en verde. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Pastos y praderas (+2.525 ha). El mayor retroceso de superficie corresponde a Sorgo forrajero en verde (−60 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 65,5 % del valor agrícola municipal. Chile verde encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Mocorito":{"profilePage":266,"reportPages":[283,284,285],"closing1":"Maíz grano fue el principal generador de valor agrícola bruto en Mocorito durante 2025, con 247,4 millones de pesos y 51,0 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Pastos y praderas (+0,2 millones de pesos respecto de 2024). En contraste, Maíz grano presentó la mayor reducción (−320,4 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Pastos y praderas, el valor varió +0,2 millones de pesos. La mayor contribución fue la de rendimiento (+0,2 millones), seguida de precio implícito (−0,0 millones). El tercer efecto aportó 0,0 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Maíz grano, el valor varió −320,4 millones de pesos. La mayor contribución fue la de superficie (−251,3 millones), seguida de rendimiento (−69,6 millones). El tercer efecto aportó +0,5 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Mocorito (40,5 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Tomate rojo (jitomate) (+67 ha). El mayor retroceso de superficie corresponde a Garbanzo grano (−9.881 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 79,0 % del valor agrícola municipal. Maíz grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Navolato":{"profilePage":286,"reportPages":[309,310,311],"closing1":"Maíz grano fue el principal generador de valor agrícola bruto en Navolato durante 2025, con 2.797,2 millones de pesos y 53,3 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Maíz grano (+410,9 millones de pesos respecto de 2024). En contraste, Tomate rojo (jitomate) presentó la mayor reducción (−1.173,8 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Maíz grano, el valor varió +410,9 millones de pesos. La mayor contribución fue la de precio implícito (+576,0 millones), seguida de rendimiento (−446,0 millones). El tercer efecto aportó +280,9 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Tomate rojo (jitomate), el valor varió −1.173,8 millones de pesos. La mayor contribución fue la de superficie (−639,4 millones), seguida de precio implícito (−637,9 millones). El tercer efecto aportó +103,5 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Navolato (46,7 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Garbanzo grano (+5.265 ha). El mayor retroceso de superficie corresponde a Sorgo grano (−1.148 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 77,9 % del valor agrícola municipal. Maíz grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Rosario":{"profilePage":312,"reportPages":[329,330,331],"closing1":"Chile verde fue el principal generador de valor agrícola bruto en Rosario durante 2025, con 1.081,5 millones de pesos y 38,7 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Chile verde (+315,8 millones de pesos respecto de 2024). En contraste, Agave presentó la mayor reducción (−78,1 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Chile verde, el valor varió +315,8 millones de pesos. La mayor contribución fue la de precio implícito (+256,3 millones), seguida de superficie (+82,3 millones). El tercer efecto aportó −22,8 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Agave, el valor varió −78,1 millones de pesos. La mayor contribución fue la de precio implícito (−490,3 millones), seguida de rendimiento (+420,4 millones). El tercer efecto aportó −8,3 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Chile verde presentó la mayor participación media en el valor agrícola registrado de Rosario (36,3 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Sorgo forrajero en verde. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Chile verde (+200 ha). El mayor retroceso de superficie corresponde a Sorgo forrajero en verde (−260 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 87,8 % del valor agrícola municipal. Chile verde encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Salvador Alvarado":{"profilePage":332,"reportPages":[347,348,349],"closing1":"Garbanzo grano fue el principal generador de valor agrícola bruto en Salvador Alvarado durante 2025, con 536,7 millones de pesos y 51,6 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Garbanzo grano (+245,1 millones de pesos respecto de 2024). En contraste, Sorgo grano presentó la mayor reducción (−53,8 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Garbanzo grano, el valor varió +245,1 millones de pesos. La mayor contribución fue la de superficie (+194,7 millones), seguida de precio implícito (+48,1 millones). El tercer efecto aportó +2,3 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Sorgo grano, el valor varió −53,8 millones de pesos. La mayor contribución fue la de superficie (−82,1 millones), seguida de rendimiento (+26,9 millones). El tercer efecto aportó +1,3 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Salvador Alvarado (37,0 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Garbanzo grano (+5.975 ha). El mayor retroceso de superficie corresponde a Sorgo grano (−3.838 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 81,6 % del valor agrícola municipal. Garbanzo grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"San Ignacio":{"profilePage":350,"reportPages":[367,368,369],"closing1":"Maíz grano fue el principal generador de valor agrícola bruto en San Ignacio durante 2025, con 67,9 millones de pesos y 36,7 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Naranja (+1,8 millones de pesos respecto de 2024). En contraste, Tomate rojo (jitomate) presentó la mayor reducción (−78,8 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Naranja, el valor varió +1,8 millones de pesos. La mayor contribución fue la de precio implícito (+3,8 millones), seguida de rendimiento (−2,0 millones). El tercer efecto aportó 0,0 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Tomate rojo (jitomate), el valor varió −78,8 millones de pesos. La mayor contribución fue la de superficie (−54,7 millones), seguida de precio implícito (−17,8 millones). El tercer efecto aportó −6,3 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de San Ignacio (28,2 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Sorgo forrajero en verde. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Maíz grano (+362 ha). El mayor retroceso de superficie corresponde a Tomate rojo (jitomate) (−91 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 78,8 % del valor agrícola municipal. Maíz grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."},"Sinaloa":{"profilePage":370,"reportPages":[391,392,393],"closing1":"Maíz grano fue el principal generador de valor agrícola bruto en Sinaloa durante 2025, con 1.410,3 millones de pesos y 34,4 % del cierre municipal. Esta posición muestra su peso en los ingresos agrícolas registrados, pero no permite concluir que sea el cultivo más rentable: la base no informa costos de insumos, salarios, tierra, comercialización ni intereses.\n\nEl mayor incremento nominal comparable correspondió a Chile verde (+160,0 millones de pesos respecto de 2024). En contraste, Garbanzo grano presentó la mayor reducción (−317,3 millones). Las diferencias se calculan en pesos corrientes; la ausencia de un cultivo en un cierre no equivale a producción efectivamente nula.","closing2":"En Chile verde, el valor varió +160,0 millones de pesos. La mayor contribución fue la de precio implícito (+71,4 millones), seguida de superficie (+57,4 millones). El tercer efecto aportó +31,1 millones. Las contribuciones suman exactamente el cambio del valor observado.\n\nEn Garbanzo grano, el valor varió −317,3 millones de pesos. La mayor contribución fue la de superficie (−229,3 millones), seguida de precio implícito (−62,1 millones). El tercer efecto aportó −25,9 millones. Las contribuciones suman exactamente el cambio del valor observado.","conclusion":"En la trayectoria 2003–2025, Maíz grano presentó la mayor participación media en el valor agrícola registrado de Sinaloa (45,0 % del total anual, en promedio); aparece en 23 cierres. Medido por tonelaje acumulado de productos reportados en toneladas, el liderazgo corresponde a Maíz grano. Estos criterios no son equivalentes: uno mide composición económica histórica y el otro volumen físico reportado.\n\nLa mayor expansión de superficie cosechada entre cultivos presentes en ambos años corresponde a Sorgo grano (+5.527 ha). El mayor retroceso de superficie corresponde a Ajonjolí (−9.535 ha). Las variaciones territoriales provienen del área cosechada registrada por cultivo, no de un seguimiento de parcelas individuales. Un cultivo puede ampliar superficie y perder valor si retrocede su rendimiento o precio implícito, y viceversa.\n\nEn 2025, los tres cultivos de mayor valor concentraron 63,4 % del valor agrícola municipal. Maíz grano encabezó la aportación económica, aunque este resultado no representa margen, rendimiento financiero ni ganancia del productor. La evaluación de rentabilidad requeriría costos, inversiones, financiamiento e ingresos netos; la comparación interanual real requiere deflactar precios."}};
let D=null,R=null;
const slug=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');

async function load(){
 const a=await fetch('./data/analysis-pack.b64');
 if(!a.ok)throw Error(`No se pudo leer la base histórica: ${a.status}`);
 if(!('DecompressionStream' in window))throw Error('Este navegador no admite descompresión GZIP. Actualízalo para consultar el observatorio.');
 const text=(await a.text()).replace(/\s/g,'');const binary=atob(text);
 const input=Uint8Array.from(binary,ch=>ch.charCodeAt(0));
 const decompressed=new Response(new Blob([input]).stream().pipeThrough(new DecompressionStream('gzip')));
 const raw=JSON.parse(await decompressed.text());R=REPORTS_EMBEDDED;
 D={meta:raw.metadata,audit:raw.audit,state:one(raw.state).map(r=>({year:+r.Anio,value:num(r.value)/1000,area:num(r.area),harvest:num(r.harvest),loss:num(r.loss),crops:num(r.crops),rows:num(r.rows)})).sort((x,y)=>x.year-y.year),
    municipalities:one(raw.municipal).map(r=>({name:r.Nommunicipio,year:+r.Anio,area:num(r.Sembrada),harvest:num(r.Cosechada),loss:num(r.Siniestrada),value:num(r.Valorproduccion)/1000})),
    municipal2025:one(raw.municipal2025).map(r=>({name:r.Nommunicipio,value:num(r.value)/1000,area:num(r.area),harvest:num(r.harvest),loss:num(r.loss),crops:num(r.crops),rows:num(r.rows)})),
    crops:one(raw.crops).map(r=>({name:r.Nomcultivo,municipio:r.Nommunicipio,year:+r.Anio,unit:r.Nomunidad,value:num(r.Valorproduccion)/1000,harvest:num(r.Cosechada),planted:num(r.Sembrada),loss:num(r.Siniestrada),volume:num(r.Volumenproduccion)})),
    records:one(raw.records2025).map(r=>({...r,value:num(r.Valorproduccion)/1000,harvest:num(r.Cosechada),planted:num(r.Sembrada),volume:num(r.Volumenproduccion)}))};
 if(D.state.length!==23||D.municipal2025.length!==18||D.crops.length!==8217||D.records.length!==637)throw Error('La cobertura no coincide con el anexo de referencia.');
 const total=sum(D.records,'value'),reported=D.state.find(r=>r.year===2025)?.value;
 if(Math.abs(total-reported)>.1)throw Error('El total estatal del cierre 2025 no coincide con las observaciones.');
 D.muniNames=uniq(D.municipalities.map(r=>r.name)).sort((a,b)=>a.localeCompare(b,'es'));
 D.cropNames=uniq(D.crops.map(r=>r.name)).sort((a,b)=>a.localeCompare(b,'es'));
 D.byMuni=new Map(D.muniNames.map(name=>[name,{annual:D.municipalities.filter(r=>r.name===name).sort((x,y)=>x.year-y.year),crops:D.crops.filter(r=>r.municipio===name),records:D.records.filter(r=>r.Nommunicipio===name),snapshot:D.municipal2025.find(r=>r.name===name)}]));
 D.byCrop=new Map(D.cropNames.map(name=>[name,{annual:D.crops.filter(r=>r.name===name),records:D.records.filter(r=>r.Nomcultivo===name)}]));
}
function tableAggregate(arr,key){const o=new Map();for(const r of arr){const name=r[key]||'Sin clasificar';const a=o.get(name)||{name,value:0,area:0,harvest:0,count:0};a.value+=r.value;a.area+=r.planted||0;a.harvest+=r.harvest||0;a.count+=1;o.set(name,a)}return [...o.values()].sort((a,b)=>b.value-a.value)}
function stats(target,rows){$(target).innerHTML=rows.filter(r=>r.value!==null&&r.value!==undefined&&!/^(s\/d|s\/r|n\/d|sin registro|sin comparación|sin datos)$/i.test(String(r.value).trim())&&String(r.value).trim()!=='').map(r=>`<div class="stat"><span class="stat-label">${esc(r.title)}</span><strong class="stat-value">${esc(r.value)}</strong><div class="stat-foot">${esc(r.note)}</div></div>`).join('')}
function rank(target,rows,limit=8,showPercent=true){const data=rows.slice(0,limit);const max=Math.max(1,...data.map(r=>r.value));const total=sum(rows,'value');$(target).innerHTML=data.length?data.map((r,i)=>`<div class="rank-row"><div class="rank-top"><span class="rank-name">${String(i+1).padStart(2,'0')} &nbsp; ${esc(r.name)}</span><strong class="rank-value">${MX(r.value)} MDP</strong></div><div class="rank-bar"><div class="rank-fill" style="width:${Math.max(0,r.value/max*100).toFixed(2)}%"></div></div>${showPercent?`<div class="rank-sub">${PCT(r.value/total*100)} del valor incluido</div>`:''}</div>`).join(''):'<p class="empty">Sin datos disponibles.</p>'}
function niceMax(max){if(max<=0)return 1;const e=Math.pow(10,Math.floor(Math.log10(max)));const v=max/e;return (v<=1?1:v<=2?2:v<=2.5?2.5:v<=5?5:10)*e}
function svgChart(target,series,options={}){
 const data=series.filter(row=>row.value!==null&&row.value!==undefined&&row.value!==''&&Number.isFinite(Number(row.year))&&Number.isFinite(Number(row.value))).slice().sort((a,b)=>a.year-b.year);
 const root=$(target);if(!root)return;
 if(!data.length){root.innerHTML='<p class="empty">No hay observaciones para representar.</p>';return}
 const seriesName=options.label||'Serie histórica';
 const unit=options.unit||'millones de pesos nominales';
 const chartState={period:'full',mode:'chart',selection:null};
 const w=840,h=326,L=74,R=25,T=25,B=53,iw=w-L-R,ih=h-T-B;
 const available=()=>data.filter(row=>chartState.period==='full'||row.year>=Number(chartState.period));
 const money=v=>Number(v).toLocaleString('es-MX',{minimumFractionDigits:1,maximumFractionDigits:1});
 function render(){
  const rows=available(),minYear=rows.length?Math.min(...rows.map(d=>d.year)):(chartState.period==='full'?2003:Number(chartState.period)),maxYear=rows.length?Math.max(...rows.map(d=>d.year)):2025;
  const minX=chartState.period==='full'?2003:Math.min(minYear,Number(chartState.period));
  const maxX=chartState.period==='full'?2025:Math.max(maxYear,2025);
  const yMax=niceMax(Math.max(1,...rows.map(r=>Number(r.value)))*1.09);
  const sx=x=>L+(x-minX)/Math.max(1,maxX-minX)*iw;
  const sy=y=>T+ih-(y/yMax)*ih;
  const yearSteps=chartState.period==='full'?[2003,2008,2013,2018,2025]:chartState.period==='2016'?[2016,2018,2020,2022,2025]:[2021,2022,2023,2024,2025];
  const grid=[0,.25,.50,.75,1].map(t=>{const y=T+ih*(1-t);return '<line x1="'+L+'" y1="'+y+'" x2="'+(w-R)+'" y2="'+y+'" stroke="#ebebeb" stroke-width="1"/><text x="'+(L-13)+'" y="'+(y+4)+'" text-anchor="end" fill="#888" font-size="11">'+esc(compact.format(yMax*t))+'</text>'}).join('');
  const ticks=yearSteps.map(y=>'<text x="'+sx(y).toFixed(2)+'" y="'+(h-17)+'" text-anchor="middle" fill="#777" font-size="11">'+y+'</text>').join('');
  let chunks=[],current=[];
  rows.forEach(d=>{if(current.length&&d.year-current[current.length-1].year>1){chunks.push(current);current=[]}current.push(d)});
  if(current.length)chunks.push(current);
  const paths=chunks.map(seq=>'<path d="'+seq.map((d,i)=>(i?'L':'M')+sx(d.year).toFixed(2)+' '+sy(d.value).toFixed(2)).join(' ')+'" stroke="#161616" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>').join('');
  const bars=rows.map((d,i)=>{
   const y=sy(d.value),x=sx(d.year),active=d.year===chartState.selection,previous=data.find(r=>r.year===d.year-1);
   const change=previous&&previous.value>0?(d.value/previous.value-1)*100:null;
   const t= d.year+' · '+money(d.value)+' '+unit+(change!==null?' · '+(change>=0?'+':'')+change.toFixed(1)+' % vs año anterior':'');
   return '<circle class="g-data-point'+(active?' active':'')+'" data-year="'+d.year+'" data-value="'+d.value+'" tabindex="0" role="button" aria-label="'+esc(t)+'" cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="'+(active?6.8:4.2)+'" fill="#111" stroke="#fff" stroke-width="2"><title>'+esc(t)+'</title></circle>';
  }).join('');
  const last=rows.at(-1);
  const dataRows=rows.map((row,i)=>{
   const prev=data.find(d=>d.year===row.year-1);
   const change=prev&&prev.value>0?((row.value/prev.value-1)*100):null;
   return '<tr><td>'+row.year+'</td><td class="numeric">'+money(row.value)+'</td><td class="numeric">'+(change===null?'':(change>0?'+':'')+change.toFixed(1)+' %')+'</td></tr>';
  }).join('');
  const countNote=rows.length+' observaciones · '+minYear+'–'+maxYear;
  root.innerHTML='<div class="g-chart-root" data-chart-mode="'+chartState.mode+'">'+
   '<div class="g-chart-bar"><div class="g-chart-meta"><span class="g-chart-overline">SERIE AGRÍCOLA</span><span class="g-chart-figures">'+countNote+'</span></div>'+
   '<div class="g-chart-controls" role="group" aria-label="Herramientas de la gráfica"><div class="g-chart-segment" role="group" aria-label="Periodo">'+
   [['full','2003–25'],['2016','Últimos 10'],['2021','Últimos 5']].map(([period,label])=>'<button type="button" data-chart-period="'+period+'" aria-pressed="'+(chartState.period===period)+'">'+label+'</button>').join('')+'</div>'+
   '<div class="g-chart-segment" role="group" aria-label="Formato"><button type="button" data-chart-mode="chart" aria-pressed="'+(chartState.mode==='chart')+'">Gráfica</button><button type="button" data-chart-mode="table" aria-pressed="'+(chartState.mode==='table')+'">Tabla</button></div>'+
   '<button type="button" class="g-chart-export" data-chart-export title="Descargar los años actualmente seleccionados">CSV ↓</button></div></div>'+
   '<div class="g-chart-visual" '+(chartState.mode==='table'?'hidden':'')+'>'+
   '<div class="g-chart-empty" '+(rows.length?'hidden':'')+'>No hay observaciones en el periodo seleccionado. Puedes ampliar el horizonte a 2003–2025.</div><svg '+(!rows.length?'hidden ':'')+'viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(seriesName)+', valor anual de '+esc(unit)+'" xmlns="http://www.w3.org/2000/svg">'+
   grid+ticks+paths+bars+'</svg><div class="g-chart-readout" role="status" aria-live="polite">'+(chartState.selection===null?'Selecciona un punto para consultar su valor exacto.':(function(){const point=rows.find(x=>x.year===chartState.selection);return point?point.year+' · '+money(point.value)+' · '+unit:'Selecciona un punto'})())+'</div></div>'+
   '<div class="g-chart-table" '+(chartState.mode==='chart'?'hidden':'')+'><div class="g-table-scroll"><table><thead><tr><th>Año</th><th class="numeric">Valor ('+esc(unit)+')</th><th class="numeric">Variación nominal interanual</th></tr></thead><tbody>'+dataRows+'</tbody></table></div></div>'+
   '<p class="g-chart-footnote">Los años sin observación no se imputan como cero. Las cifras nominales no equivalen a variaciones reales ni a utilidades.</p></div>';
  root.querySelectorAll('[data-chart-period]').forEach(b=>b.addEventListener('click',()=>{chartState.period=b.dataset.chartPeriod;chartState.selection=null;render()}));
  root.querySelectorAll('button[data-chart-mode]').forEach(b=>b.addEventListener('click',()=>{chartState.mode=b.dataset.chartMode;render()}));
  root.querySelector('[data-chart-export]')?.addEventListener('click',()=>downloadCSV('growa_serie_'+target+'_'+chartState.period+'.csv',rows.map(d=>({anio:d.year,valor:d.value,unidad:unit}))));
  const readout=root.querySelector('.g-chart-readout');
  root.querySelectorAll('.g-data-point').forEach(point=>{
   const selectPoint=()=>{
    root.querySelectorAll('.g-data-point').forEach(p=>{p.classList.remove('active');p.setAttribute('r','4.2')});
    point.classList.add('active');point.setAttribute('r','6.8');
    const year=Number(point.dataset.year),value=Number(point.dataset.value);
    chartState.selection=year;readout.textContent=year+' · '+money(value)+' · '+unit;
   };
   point.addEventListener('mouseenter',selectPoint);
   point.addEventListener('focus',selectPoint);
   point.addEventListener('click',selectPoint);
   point.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPoint()}});
  });
 }
 render();
}
function navigate(tab){state.tab=tab;document.body.dataset.view=tab;document.title=tab==='laboratorio'?'Growa | Laboratorio de análisis territorial':tab==='mexico'?'Growa | Agricultura de México 2003–2025':'Growa | Inteligencia agrícola territorial';const crumb=document.querySelector('.breadcrumb');if(crumb)crumb.innerHTML=tab==='laboratorio'?'GROWA <span>/</span> RESEARCH <span>/</span> LABORATORIO':tab==='mexico'?'GROWA <span>/</span> OBSERVATORIO AGRÍCOLA <span>/</span> MÉXICO':'GROWA <span>/</span> OBSERVATORIO AGRÍCOLA <span>/</span> SINALOA';for(const btn of document.querySelectorAll('[data-tab]'))btn.classList.toggle('active',btn.dataset.tab===tab);for(const panel of document.querySelectorAll('.section-panel'))panel.hidden=panel.id!==`panel-${tab}`;if(location.hash!==`#${tab}`)history.replaceState(null,'',`#${tab}`);window.scrollTo({top:0,behavior:'instant'})}
function downloadCSV(name,rows){if(!rows.length)return;const keys=Object.keys(rows[0]);const escapeCell=s=>`"${String(s??'').replace(/"/g,'""')}"`;const csv='\ufeff'+[keys.join(','),...rows.map(r=>keys.map(k=>escapeCell(r[k])).join(','))].join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url)}
function renderPanorama(){const latest=D.state.at(-1),prior=D.state.at(-2),top=tableAggregate(D.records,'Nomcultivo');stats('state-stats',[
 {title:'Valor de producción 2025',value:`${MX(latest.value)} MDP`,note:`${PCT((latest.value/prior.value-1)*100)} respecto a 2024`},
 {title:'Superficie cosechada',value:`${INT(latest.harvest)} ha`,note:'Suma de hectáreas por cultivo y ciclo'},
 {title:'Cultivos reportados',value:String(latest.crops),note:'Catálogo observable en 2025'},
 {title:'Municipios históricos',value:'18',note:'Unidad territorial de la fuente'}]);
 
 const topMunicipal=D.municipal2025.slice().sort((a,b)=>b.value-a.value);
 const topTerritories=topMunicipal.slice(0,3);
 const territoryPct=topTerritories.reduce((acc,row)=>acc+row.value,0)/latest.value*100;
 const topCultivos=top.slice(0,3);
 const cropsPct=topCultivos.reduce((acc,row)=>acc+row.value,0)/latest.value*100;
 const changeNominal=(latest.value/prior.value-1)*100;
 const blocks=[
   {number:'01',tag:'CONCENTRACIÓN TERRITORIAL',main:PCT(territoryPct),headline:'del valor está en los tres municipios principales',detail:topTerritories.map(x=>x.name).join(' · ')},
   {number:'02',tag:'ESTRUCTURA DE CULTIVOS',main:PCT(cropsPct),headline:'del valor proviene de tres cultivos',detail:topCultivos.map(x=>x.name).join(' · ')},
   {number:'03',tag:'BALANCE INTERANUAL',main:PCT(changeNominal),headline:'variación del valor agrícola frente a 2024',detail:'Comparación a precios corrientes; no representa una variación real.'}
 ];
 $('state-insights').innerHTML=blocks.map(b=>'<article class="brief-item"><span class="brief-number">'+b.number+'</span><span class="brief-tag">'+esc(b.tag)+'</span><strong>'+esc(b.main)+'</strong><h4>'+esc(b.headline)+'</h4><p>'+esc(b.detail)+'</p></article>').join('');
 
 svgChart('chart-state',D.state.map(r=>({year:r.year,value:r.value})),{label:'Valor estatal 2003 a 2025'});
  $('state-reference-years').innerHTML='<div class="reference-title">CUATRO MOMENTOS DE LA SERIE</div>'+[2003,2015,2023,2025].map(y=>{const r=D.state.find(x=>x.year===y);return `<div class="reference-year"><small>${y}</small><strong>${MX(r.value)}</strong><span>MDP nominales</span></div>`}).join('');
  rank('state-crops',top,10);
 const muni=D.municipal2025.slice().sort((a,b)=>b.value-a.value);
 $('state-municipios').innerHTML=muni.map(r=>{const hist=D.byMuni.get(r.name).annual,y24=hist.find(x=>x.year===2024),change=y24&&y24.value>0?(r.value/y24.value-1)*100:null;return `<button class="municipality-item" type="button" data-open-muni="${esc(r.name)}"><span class="municipality-name">${esc(r.name)}</span><span class="municipality-value">${MX(r.value)} MDP</span><span class="municipality-sub">${PCT(change)} vs. 2024 · ${r.crops} cultivos</span><span class="municipality-arrow">↗</span></button>`}).join('');
}
function currentMuniCropRows(name){const rec=D.byMuni.get(name).records,hist=D.byMuni.get(name).crops;const current=tableAggregate(rec,'Nomcultivo');const all=uniq(hist.map(r=>r.name)).map(crop=>{const c25=current.find(x=>x.name===crop),y24=hist.find(r=>r.name===crop&&r.year===2024),y25=hist.find(r=>r.name===crop&&r.year===2025);return {name:crop,value:c25?.value??(y25?y25.value:null),change:y24&&y25?y25.value-y24.value:null,prior:y24?.value??null,series:hist.filter(r=>r.name===crop),records:rec.filter(r=>r.Nomcultivo===crop)}});return all}
function renderMunicipio(){const name=state.municipio,info=D.byMuni.get(name),year25=info.snapshot,y24=info.annual.find(r=>r.year===2024),change=y24?.value?((year25.value/y24.value)-1)*100:null,leader=tableAggregate(info.records,'Nomcultivo');
 $('municipio').value=name;$('municipio-name').textContent=name;$('municipio-value').textContent=MX(year25.value);$('municipio-lede').textContent=`${leader[0]?.name||'Cultivo no disponible'} encabezó el valor bruto de 2025. El expediente reúne series históricas, datos operativos y conclusiones documentales.`;
 stats('municipio-stats',[{title:'Variación nominal',value:PCT(change),note:'2024 a 2025'},{title:'Superficie cosechada',value:`${INT(year25.harvest)} ha`,note:'Suma registrada en 2025'},{title:'Cultivos presentes',value:String(year25.crops),note:'Catálogo del cierre 2025'},{title:'Aporte estatal',value:PCT(year25.value/D.state.at(-1).value*100),note:'Participación en el valor de Sinaloa'}]);
 const measure=state.municipioMetric;svgChart('chart-municipio',info.annual.map(r=>({year:r.year,value:measure==='value'?r.value:r.harvest})),{label:`Evolución de ${name}`,unit:measure==='value'?'millones de pesos corrientes':'hectáreas reportadas'});document.querySelectorAll('[data-metric]').forEach(b=>b.classList.toggle('active',b.dataset.metric===measure));rank('municipio-rank',leader,10);
 const rep=R[name];$('report-pages').textContent=rep?`PÁGINAS ${rep.reportPages.join(' · ')}`:'';const sections=[['01','Valor económico y cambios recientes',rep?.closing1,rep?.reportPages[0]],['02','Origen contable de la variación',rep?.closing2,rep?.reportPages[1]],['03','Conclusión económico-territorial',rep?.conclusion,rep?.reportPages[2]]];
 $('municipio-report').innerHTML=sections.map((section,i)=>{const [number,title,txt,page]=section,paras=(txt||'Sin texto documental disponible.').split(/\n\n+/).map(x=>`<p>${esc(x)}</p>`).join('');return `<details class="disclosure" ${i===2?'open':''}><summary><span><span class="disclosure-title">${esc(number)}. ${esc(title)}</span><span class="disclosure-sub">Texto del informe original · página ${page}</span></span><span class="disclosure-end">+</span></summary><div class="disclosure-body"><span class="report-sublabel">EXTRACTO DOCUMENTAL · PÁGINA ${page}</span><div class="report-text">${paras}</div><p class="report-source">Fuente: Agricultura de Sinaloa 2003–2025, capítulo ${esc(name)}. No sustituye la lectura de las tablas y notas metodológicas originales.</p></div></details>`}).join('');
 state.activeMunicipioCrop=null;renderMuniCropList();
}
function renderMuniCropList(){const list=currentMuniCropRows(state.municipio),search=state.search.toLocaleLowerCase('es');let filtered=list.filter(r=>r.name.toLocaleLowerCase('es').includes(search));filtered.sort(state.order==='name'?(a,b)=>a.name.localeCompare(b.name,'es'):(a,b)=>(b.value??-1)-(a.value??-1));$('crop-count').textContent=`${list.length} SERIES HISTÓRICAS`;const active=filtered.find(r=>r.name===state.activeMunicipioCrop)?.name??filtered[0]?.name;if(active)state.activeMunicipioCrop=active;
 $('municipio-crop-list').innerHTML=filtered.length?filtered.map(r=>`<button type="button" class="crop-choice ${r.name===active?'active':''}" data-muni-crop="${esc(r.name)}"><span><strong>${esc(r.name)}</strong><small>${r.series.length} años reportados</small></span><b>${Number.isFinite(r.value)?MX(r.value):''}</b></button>`).join(''):'<p class="empty">No hay cultivos que coincidan con tu búsqueda.</p>';
 renderMuniCropDetail(filtered.find(r=>r.name===active));
}
function renderMuniCropDetail(row){const el=$('municipio-crop-detail');if(!row){el.innerHTML='<p class="empty">Sin cultivos disponibles.</p>';return}const series=row.series.slice().sort((a,b)=>a.year-b.year),records=row.records,unit=series.at(-1)?.unit||'unidad de origen',byVariety=tableAggregate(records,'Nomvariedad'),byMode=tableAggregate(records,'Nommodalidad');
 const y24=series.find(r=>r.year===2024),y25=series.find(r=>r.year===2025),pctChange=y24&&y25&&y24.value>0?(y25.value/y24.value-1)*100:null;
 el.innerHTML=`<span class="eyebrow">${esc(state.municipio)} / CULTIVO</span><h4>${esc(row.name)}</h4><p class="detail-summary">Evolución histórica del valor registrado entre 2003 y 2025. Cada año sin registro permanece ausente en la gráfica.</p><div class="detail-stat-line"><div><strong>${Number.isFinite(row.value)?`${MX(row.value)} MDP`:''}</strong><span>VALOR 2025</span></div>${Number.isFinite(pctChange)?`<div><strong>${PCT(pctChange)}</strong><span>VARIACIÓN 2024–2025</span></div>`:''}<div><strong>${INT(series.length)}</strong><span>AÑOS REPORTADOS</span></div></div><div id="crop-individual-chart" class="chart"></div><div class="detail-tabs"><span class="detail-tag">Unidad: ${esc(unit)}</span>${byMode[0]?`<span class="detail-tag">Modalidad líder: ${esc(byMode[0].name)}</span>`:''}${byVariety[0]?`<span class="detail-tag">Variedad líder: ${esc(byVariety[0].name)}</span>`:''}</div><div class="report-sublabel">DETALLE DISPONIBLE DEL CIERRE 2025</div><div id="crop-individual-table"></div><p class="fineprint">El desglose por variedad y modalidad es exclusivo de 2025. No permite establecer costos, rentabilidad ni causalidad.</p>`;
 svgChart('crop-individual-chart',series.map(r=>({year:r.year,value:r.value})),{label:`Serie de ${row.name} en ${state.municipio}`});$('crop-individual-table').innerHTML=byVariety.length?`<table class="mini-table"><thead><tr><th>Variedad</th><th>Valor 2025 (MDP)</th></tr></thead><tbody>${byVariety.slice(0,8).map(x=>`<tr><td>${esc(x.name)}</td><td>${MX(x.value)}</td></tr>`).join('')}</tbody></table>`:'<p class="empty">No hay desglose de 2025 para este cultivo.</p>';
}
function cropInfo(name){const obj=D.byCrop.get(name),annual=[];const annualMap=new Map();for(const r of obj.annual){const v=annualMap.get(r.year)||0;annualMap.set(r.year,v+r.value)}for(const [year,value]of annualMap)annual.push({year,value});annual.sort((a,b)=>a.year-b.year);return {...obj,aggregated:annual,now:annual.find(r=>r.year===2025)?.value??null,prior:annual.find(r=>r.year===2024)?.value??null}}
function renderCultivo(){const name=state.cultivo,info=cropInfo(name),byMuni=tableAggregate(info.records,'Nommunicipio'),byVariety=tableAggregate(info.records,'Nomvariedad');$('cultivo').value=name;$('crop-name').textContent=name;$('crop-value').textContent=MX(info.now);$('crop-lede').textContent=`El cultivo aparece en ${info.aggregated.length} cierres anuales. El detalle por variedades y tecnología corresponde a las observaciones de 2025.`;
 const ch=info.prior!==null&&info.now!==null&&info.prior>0?(info.now/info.prior-1)*100:null;stats('crop-stats',[{title:'Cambio nominal',value:PCT(ch),note:'2024 a 2025, si hay registros'},{title:'Años observados',value:String(info.aggregated.length),note:'Sin imputación de años faltantes'},{title:'Municipios 2025',value:String(byMuni.length),note:'Con observaciones del cultivo'},{title:'Variedades 2025',value:String(byVariety.length),note:'Etiquetas observadas en el cierre'}]);svgChart('chart-crop',info.aggregated,{label:`Valor estatal: ${name}`});rank('crop-municipios',byMuni,12);
 const dimensions=[['Variedades','Nomvariedad'],['Modalidad de agua','Nommodalidad'],['Ciclo productivo','Nomcicloproductivo'],['Tecnología','TipoTecnologia'],['Tipo de producción','TipoProduccion'],['Destino de mercado','TipoMercado']];$('crop-dimensions').innerHTML=dimensions.map(([title,key],i)=>{const rows=tableAggregate(info.records,key);const total=sum(rows,'value');return `<details class="disclosure" ${i===0?'open':''}><summary><span><span class="disclosure-title">${esc(title)}</span><span class="disclosure-sub">${rows.length} categorías registradas en 2025</span></span><span class="disclosure-end">+</span></summary><div class="disclosure-body"><table class="mini-table"><thead><tr><th>Categoría</th><th>Participación del valor 2025</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.name)}</td><td>${PCT(total?x.value/total*100:null)} · ${MX(x.value)} MDP</td></tr>`).join('')}</tbody></table></div></details>`}).join('');
 const municipalityGroups=uniq(info.annual.map(r=>r.municipio)).map(m=>({name:m,series:info.annual.filter(r=>r.municipio===m).sort((a,b)=>a.year-b.year)})).sort((a,b)=>(b.series.find(r=>r.year===2025)?.value??-1)-(a.series.find(r=>r.year===2025)?.value??-1));$('crop-municipal-details').innerHTML=municipalityGroups.map((o,i)=>{const r24=o.series.find(x=>x.year===2024),r25=o.series.find(x=>x.year===2025),diff=r24&&r25?r25.value-r24.value:null;return `<details class="disclosure"><summary><span><span class="disclosure-title">${esc(o.name)}</span><span class="disclosure-sub">${Number.isFinite(r25?.value)?`Valor 2025: ${MX(r25.value)} MDP · `:''}${o.series.length} años reportados</span></span><span class="disclosure-end">+</span></summary><div class="disclosure-body"><div class="report-sublabel">TRAYECTORIA INDIVIDUAL · ${esc(name)}</div><div id="crop-territory-${i}" class="chart" data-year-chart="${i}"></div><div class="detail-stat-line">${Number.isFinite(diff)?`<div><strong>${DIF(diff)} MDP</strong><span>DIFERENCIA 2024–2025</span></div>`:''}${r24&&r25&&r24.value>0?`<div><strong>${PCT((r25.value/r24.value-1)*100)}</strong><span>VARIACIÓN NOMINAL</span></div>`:''}</div></div></details>`}).join('');
 $('crop-municipal-details').querySelectorAll('details').forEach((details,i)=>{details.addEventListener('toggle',()=>{if(details.open){svgChart(`crop-territory-${i}`,municipalityGroups[i].series,{label:`${name} en ${municipalityGroups[i].name}`})}})});
}
function renderMetodologia(){const audit=D.audit;stats('method-stats',[{title:'Observaciones declaradas',value:INT(audit.filas),note:'Conjunto original Sinaloa 2003–2025'},{title:'Variables originales',value:String(audit.variables),note:'Esquema de la fuente'},{title:'Municipios',value:String(audit.municipios),note:'Claves históricas de origen'},{title:'Años de referencia',value:String(audit.anios),note:'2003 a 2025'}]);$('method-source').innerHTML=`<p><strong>Fuente primaria.</strong> Cierres agrícolas municipales DGSIAP, consolidados en los anexos del informe Agricultura de Sinaloa 2003–2025.</p><p><strong>Observación estadística.</strong> Combinación de municipio, año, cultivo, variedad y otras dimensiones reportadas; no representa a un productor ni a una parcela individual.</p><p><strong>Serie histórica.</strong> 23 cierres para el agregado estatal y municipal. Los registros originales con variedades, ciclos, riego y tecnología incorporados a esta plataforma son de 2025.</p><p><strong>Informe de referencia.</strong> El PDF original tiene 395 páginas. Las conclusiones de cierre I–III de cada municipio se transcribieron desde sus páginas correspondientes, sin formular juicios causales adicionales.</p>`;
 $('method-cautions').innerHTML=`<p><strong>Valores nominales.</strong> Los importes se expresan en pesos corrientes. Una variación monetaria puede reflejar cambios de precio, volumen y mezcla de cultivos. No expresa crecimiento real ni utilidad.</p><p><strong>Hectáreas.</strong> La suma anual de superficie sembrada y cosechada acumula cultivos y ciclos. No debe leerse como una medida de superficie física única.</p><p><strong>Ausencias.</strong> Un cultivo sin registro en determinado cierre no se interpreta automáticamente como producción cero.</p><p><strong>Rupturas y territorio.</strong> Los cambios de cobertura del catálogo en 2020–2021 y el reporte de solo 3 ha siniestradas en 2025 requieren contraste externo. Se mantienen las 18 claves municipales históricas de la fuente.</p><p><strong>Alcance de auditoría.</strong> Los controles anexos son los que acompañan la base recibida; no representan una revalidación externa de DGSIAP.</p>`;
 const labels=[['Filas originales',audit.filas],['Duplicados exactos',audit.duplicados_exactos],['Duplicados de clave',audit.duplicados_clave],['Valores faltantes',audit.nulos],['Cosechada > sembrada',audit.cosechada_supera_sembrada],['Diferencia de valor > 1%',audit.valor_desviacion_superior_1pct],['Rendimiento fuera de tolerancia',audit.rendimiento_desviacion_superior_0025],['Registros no expresados en toneladas',audit.no_toneladas],['Clave municipal histórica',audit.municipios]];$('method-audit').innerHTML=labels.map(([label,v])=>`<div class="audit-item"><strong>${INT(v)}</strong><span>${esc(label)}</span></div>`).join('');
}
/* Consulta temporal, comparación y búsqueda global. No altera las fuentes DGSIAP. */
let referenceYear=2025;
let compareA='Mazatlán';
let compareB='Culiacán';
let commandItems=[];
let commandIndex=0;
let commandPreviousFocus=null;

function installResearchTools(){
 for(const year of D.state.map(x=>x.year).sort((a,b)=>b-a)){
  const option=document.createElement('option');option.value=String(year);option.textContent=String(year);$('year-select').append(option);
 }
 $('year-select').value=String(referenceYear);
 for(const id of ['compare-a','compare-b']){
  const select=$(id);
  for(const name of D.muniNames){const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option)}
 }
 $('compare-a').value=compareA;$('compare-b').value=compareB;
 $('year-select').addEventListener('change',event=>{referenceYear=Number(event.target.value);renderHistoricalYear()});
 $('compare-a').addEventListener('change',event=>{compareA=event.target.value;renderComparison()});
 $('compare-b').addEventListener('change',event=>{compareB=event.target.value;renderComparison()});
 $('compare-export').addEventListener('click',()=>{
  const aa=D.byMuni.get(compareA)?.annual||[],bb=D.byMuni.get(compareB)?.annual||[];
  const years=D.state.map(s=>s.year);
  downloadCSV(`growa_comparacion_${slug(compareA)}_${slug(compareB)}_2003_2025.csv`,years.map(year=>({
   anio:year,
   municipio_A:compareA,
   valor_A_mdp:aa.find(x=>x.year===year)?.value??null,
   municipio_B:compareB,
   valor_B_mdp:bb.find(x=>x.year===year)?.value??null
  })));
 });
 renderHistoricalYear();renderComparison();
 $('open-search').addEventListener('click',()=>openCommand());
 $('close-search').addEventListener('click',closeCommand);
 $('search-dialog').addEventListener('click',event=>{if(event.target.dataset.closeSearch==='true')closeCommand()});
 $('global-search').addEventListener('input',()=>renderCommandResults());
 $('global-search').addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'){event.preventDefault();commandIndex=Math.min(commandIndex+1,commandItems.length-1);renderCommandResults()}
  if(event.key==='ArrowUp'){event.preventDefault();commandIndex=Math.max(commandIndex-1,0);renderCommandResults()}
  if(event.key==='Enter'&&commandItems[commandIndex]){event.preventDefault();followCommand(commandItems[commandIndex])}
 });
 $('search-results').addEventListener('click',event=>{
  const btn=event.target.closest('[data-command-index]');if(!btn)return;
  const item=commandItems[Number(btn.dataset.commandIndex)];if(item)followCommand(item);
 });
 document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
   event.preventDefault();$('search-dialog').hidden?openCommand():closeCommand();
  }
  if(event.key==='Escape'&&!$('search-dialog').hidden){event.preventDefault();closeCommand()}
 });
}
function renderHistoricalYear(){
 const year=referenceYear,stateRow=D.state.find(x=>x.year===year),previous=D.state.find(x=>x.year===year-1);
 const histMuni=D.municipalities.filter(x=>x.year===year).map(x=>({name:x.name,value:x.value})).sort((a,b)=>b.value-a.value);
 const crops=D.crops.filter(x=>x.year===year),cropMap=new Map();
 for(const r of crops)cropMap.set(r.name,(cropMap.get(r.name)||0)+r.value);
 const cropRows=[...cropMap].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
 const change=previous&&previous.value>0?(stateRow.value/previous.value-1)*100:null;
 $('year-summary').innerHTML=`<div class="year-overline"><span>CIERRE SELECCIONADO</span><strong>${year}</strong></div>
 <div class="year-metrics">
  <div><small>VALOR BRUTO NOMINAL</small><strong>${MX(stateRow.value)} <i>MDP</i></strong></div>
  <div><small>VARIACIÓN RESPECTO AL AÑO PREVIO</small>${previous?`<strong>${PCT(change)}</strong>`:''}</div>
  <div><small>CULTIVOS OBSERVADOS</small><strong>${cropRows.length}</strong></div>
  <div><small>SUPERFICIE COSECHADA ACUMULADA</small><strong>${INT(stateRow.harvest)} <i>ha</i></strong></div>
 </div>`;
 $('year-crop-caption').textContent=`CULTIVOS DE ${year}`;
 $('year-muni-caption').textContent=`MUNICIPIOS DE ${year}`;
 rank('year-crop-rank',cropRows,8);
 rank('year-muni-rank',histMuni,8);
}
function renderComparison(){
 const a=D.byMuni.get(compareA),b=D.byMuni.get(compareB);
 if(!a||!b)return;
 const a25=a.annual.find(r=>r.year===2025),b25=b.annual.find(r=>r.year===2025);
 const a24=a.annual.find(r=>r.year===2024),b24=b.annual.find(r=>r.year===2024);
 const share=(x)=>D.state.at(-1).value>0?x.value/D.state.at(-1).value*100:null;
 const rows=[
  {name:compareA,now:a25,previous:a24,leader:tableAggregate(a.records,'Nomcultivo')[0]?.name},
  {name:compareB,now:b25,previous:b24,leader:tableAggregate(b.records,'Nomcultivo')[0]?.name}
 ];
 $('comparison-stats').innerHTML=rows.map((r,i)=>`<div class="compare-stat ${i===1?'compare-secondary':''}">
  <div class="compare-upper"><span class="compare-mark">${i===0?'A':'B'}</span><h4>${esc(r.name)}</h4><button type="button" data-go-muni="${esc(r.name)}" class="compare-open">Ver expediente ↗</button></div>
  <strong class="compare-value">${MX(r.now.value)} <small>MDP</small></strong>
  <div class="compare-facts">${r.previous?.value>0?`<span>${PCT((r.now.value/r.previous.value-1)*100)} vs. 2024</span>`:''}${Number.isFinite(share(r.now))?`<span>${PCT(share(r.now))} del valor estatal</span>`:''}</div>
  ${r.leader?`<div class="compare-lead">Cultivo principal en 2025: <strong>${esc(r.leader)}</strong></div>`:''}
 </div>`).join('');
 $('comparison-stats').querySelectorAll('[data-go-muni]').forEach(button=>button.addEventListener('click',()=>{
  state.municipio=button.dataset.goMuni;
  state.activeMunicipioCrop=null;state.search='';$('municipio-search').value='';renderMunicipio();navigate('municipios');
 }));
 renderComparisonChart('comparison-chart',a.annual,b.annual,compareA,compareB);
 $('comparison-note').textContent=compareA===compareB?'Ambos selectores muestran el mismo municipio. Elige otro para comparar dos trayectorias.':'Dos series con la misma escala vertical. La línea continua representa A y la discontinua B; las variaciones son nominales.';
}
function renderComparisonChart(target,left,right,leftName,rightName){
 const years=D.state.map(x=>x.year);
 const w=820,h=320,L=65,R=18,T=28,B=56,iw=w-L-R,ih=h-T-B;
 const lmap=new Map(left.map(x=>[x.year,x.value])),rmap=new Map(right.map(x=>[x.year,x.value]));
 const max=niceMax(Math.max(1,...left.map(x=>x.value),...right.map(x=>x.value))*1.06);
 const sx=x=>L+(x-2003)/(2025-2003)*iw,sy=y=>T+ih-(y/max)*ih;
 const grid=[0,.25,.5,.75,1].map(t=>{const y=T+ih*(1-t);return `<line x1="${L}" y1="${y}" x2="${w-R}" y2="${y}" stroke="#e5e5e5"/><text x="${L-11}" y="${y+4}" text-anchor="end" font-size="11" fill="#666">${esc(compact.format(max*t))}</text>`}).join('');
 const ticks=[2003,2008,2013,2018,2025].map(x=>`<text x="${sx(x)}" y="${h-16}" text-anchor="middle" font-size="11" fill="#666">${x}</text>`).join('');
 const points=(m)=>years.filter(y=>m.has(y)).map(y=>`${sx(y).toFixed(2)},${sy(m.get(y)).toFixed(2)}`).join(' ');
 const shades=`<polyline fill="none" stroke="#111" stroke-width="2.8" points="${points(lmap)}"/><polyline fill="none" stroke="#717171" stroke-dasharray="6 5" stroke-width="2.6" points="${points(rmap)}"/>`;
 $(target).innerHTML=`<div class="compare-legend"><span><i class="legend-line"></i>${esc(leftName)}</span><span><i class="legend-line dashed"></i>${esc(rightName)}</span></div>
 <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Comparación de los valores agrícolas de ${esc(leftName)} y ${esc(rightName)}" xmlns="http://www.w3.org/2000/svg">${grid}${ticks}${shades}</svg>
 <div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Indicador</th><th>${esc(leftName)}</th><th>${esc(rightName)}</th></tr></thead><tbody>
 <tr><td>Valor 2003 (MDP)</td><td>${MX(lmap.get(2003))}</td><td>${MX(rmap.get(2003))}</td></tr>
 <tr><td>Valor 2025 (MDP)</td><td>${MX(lmap.get(2025))}</td><td>${MX(rmap.get(2025))}</td></tr>
 <tr><td>Cambio 2024–2025 (MDP)</td><td>${DIF(lmap.get(2025)-lmap.get(2024))}</td><td>${DIF(rmap.get(2025)-rmap.get(2024))}</td></tr>
 </tbody></table></div>`;
}
function openCommand(){
 commandPreviousFocus=document.activeElement;
 $('search-dialog').hidden=false;document.body.classList.add('dialog-open');
 $('global-search').value='';commandIndex=0;renderCommandResults();$('global-search').focus();
}
function closeCommand(){
 $('search-dialog').hidden=true;document.body.classList.remove('dialog-open');
 commandPreviousFocus?.focus?.();
}
function renderCommandResults(){
 const term=$('global-search').value.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const normalize=(value)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const national=window.GrowaNationalData||{crops:[],states:[],munis:[]};
 const pool=[...D.muniNames.map(name=>({name,type:'municipio'})),...D.cropNames.map(name=>({name,type:'cultivo'})),...national.crops.map((row,index)=>({name:row[0],type:'mx-cultivo',index})),...national.states.map((row,index)=>({name:row[0],type:'mx-estado',index})),...national.munis.map((row,index)=>({name:row[0]+' · '+row[1],type:'mx-municipio',index}))];
 commandItems=pool.filter(item=>normalize(item.name).includes(term)).sort((a,b)=>{
  const score=(item)=>{const name=normalize(item.name);return (name===term?0:name.startsWith(term)?1:2)};
  return score(a)-score(b)||(b.type==='cultivo'?cropInfo(b.name).now||0:0)-(a.type==='cultivo'?cropInfo(a.name).now||0:0)||a.name.localeCompare(b.name,'es');
 }).slice(0,14);
 if(commandIndex>=commandItems.length)commandIndex=0;
 $('search-results').innerHTML=commandItems.length?commandItems.map((item,index)=>`<button type="button" class="command-result ${index===commandIndex?'selected':''}" role="option" aria-selected="${index===commandIndex}" data-command-index="${index}"><span class="command-category">${({municipio:'MUNICIPIO · SINALOA',cultivo:'CULTIVO · SINALOA','mx-cultivo':'CULTIVO · MÉXICO','mx-estado':'ENTIDAD · MÉXICO','mx-municipio':'MUNICIPIO · MÉXICO'}[item.type]||'ANÁLISIS')}</span><strong>${esc(item.name)}</strong><span class="command-arrow" aria-hidden="true">↗</span></button>`).join(''):'<p class="empty">No se encontraron coincidencias.</p>';
}
function followCommand(item){
 closeCommand();
 if(window.GrowaExplorer&&item.type==='municipio'){window.GrowaExplorer.openState('Sinaloa',item.name);closeCommand();return;}
 if(window.GrowaExplorer&&item.type==='cultivo'){window.GrowaExplorer.openCrop('sinaloa',item.name);closeCommand();return;}
 if(window.GrowaExplorer&&item.type&&item.type.indexOf('mx-')===0){
   closeCommand();
   if(item.type==='mx-cultivo')window.GrowaExplorer.openCrop('mexico',item.name);
   else if(item.type==='mx-estado')window.GrowaExplorer.openState(item.name);
   else window.GrowaExplorer.openState(item.name.split(' · ').slice(1).join(' · '));
   return;
 }
 if(item.type&&item.type.indexOf('mx-')===0){
  navigate('mexico');
  const category=item.type==='mx-cultivo'?'cultivos':item.type==='mx-estado'?'estados':'municipios';
  document.querySelector('.mx-tab[data-mx-tab="'+category+'"]')?.click();
  const control=$(category==='cultivos'?'mx-crop-select':category==='estados'?'mx-state-select':'mx-muni-select');
  if(control){control.value=String(item.index);control.dispatchEvent(new Event('change',{bubbles:true}))}
  return;
 }
 if(item.type==='municipio'){
  state.municipio=item.name;state.activeMunicipioCrop=null;state.search='';$('municipio-search').value='';renderMunicipio();navigate('municipios');
 }else{
  state.cultivo=item.name;renderCultivo();navigate('cultivos');
 }
}

function bind(){document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.tab)));document.querySelectorAll('[data-export]').forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.export;if(mode==='state')downloadCSV('sinaloa_estado_2003_2025.csv',D.state);if(mode==='municipality')downloadCSV(`sinaloa_${slug(state.municipio)}_2003_2025.csv`,D.byMuni.get(state.municipio).annual);if(mode==='crop')downloadCSV(`sinaloa_cultivo_${slug(state.cultivo)}.csv`,cropInfo(state.cultivo).aggregated)}));$('state-municipios').addEventListener('click',e=>{const btn=e.target.closest('[data-open-muni]');if(!btn)return;state.municipio=btn.dataset.openMuni;renderMunicipio();navigate('municipios')});$('municipio').addEventListener('change',e=>{state.municipio=e.target.value;state.search='';$('municipio-search').value='';renderMunicipio()});$('cultivo').addEventListener('change',e=>{state.cultivo=e.target.value;renderCultivo()});document.querySelectorAll('[data-metric]').forEach(btn=>btn.addEventListener('click',()=>{state.municipioMetric=btn.dataset.metric;renderMunicipio()}));$('municipio-search').addEventListener('input',e=>{state.search=e.target.value;renderMuniCropList()});$('municipio-order').addEventListener('change',e=>{state.order=e.target.value;renderMuniCropList()});$('municipio-crop-list').addEventListener('click',e=>{const btn=e.target.closest('[data-muni-crop]');if(!btn)return;state.activeMunicipioCrop=btn.dataset.muniCrop;renderMuniCropList()});window.addEventListener('hashchange',()=>{const tab=location.hash.slice(1);if(['panorama','explorar-estados','explorar-cultivos','laboratorio','municipios','cultivos','mexico','metodologia','agua'].includes(tab))navigate(tab)})}
async function init(){try{await load();window.GrowaSinaloaData={D,R};window.dispatchEvent(new Event('growa:data-ready'));for(const m of D.muniNames){const o=document.createElement('option');o.value=m;o.textContent=m;$('municipio').append(o)}for(const c of D.cropNames){const o=document.createElement('option');o.value=c;o.textContent=c;$('cultivo').append(o)}bind();installResearchTools();renderPanorama();renderMunicipio();renderCultivo();renderMetodologia();navigate(['panorama','explorar-estados','explorar-cultivos','laboratorio','municipios','cultivos','mexico','metodologia','agua'].includes(location.hash.slice(1))?location.hash.slice(1):'panorama');$('status').textContent='Datos cargados · DGSIAP';}catch(err){console.error(err);$('status').textContent='No se pudo cargar la serie';$('alert').hidden=false;$('alert').textContent='No se pudieron inicializar los datos del observatorio: '+err.message}}

// Accesos rápidos de consulta: / enfoca búsqueda municipal, Esc limpia.
document.addEventListener('keydown',event=>{
 if(event.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){
  event.preventDefault();navigate('municipios');$('municipio-search')?.focus();
 }
 if(event.key==='Escape'&&document.activeElement?.id==='municipio-search'){
  $('municipio-search').value='';state.search='';renderMuniCropList();$('municipio-search').blur();
 }
});
window.GrowaChart=svgChart;
window.GrowaDownloadCSV=downloadCSV;
window.GrowaNavigate=navigate;
window.addEventListener('hashchange',()=>{const tab=location.hash.slice(1);if(['panorama','explorar-estados','explorar-cultivos','laboratorio','metodologia','agua'].includes(tab)&&state.tab!==tab)navigate(tab)});
init();
})();


/* GROWA NATIONAL REPORT MODULE */
/* Published figures transcribed from the 115-page national report.
   This is a REPORT SUMMARY, not the 879,785 original DGSIAP micro-records. */
(()=>{
'use strict';
const crops=[
["Aguacate",3.16,6.84,3.68,59589.7,4.6,19,4,"Michoacán",44132.5,"La superficie cosechada media aumentó 155,2 % entre trienios; el volumen del segmento en toneladas, 192,6 %. La ganancia de cuota no equivale por sí sola a rentabilidad. La variedad Hass concentra la mayor parte del valor en 2025."],
["Agave",1.47,4.08,2.61,15798.6,-63.4,24,5,"Jalisco",7557.6,"La ganancia de cuota de largo plazo convive con una fuerte caída nominal en 2025. La maduración de un cultivo perenne dificulta asociar los cambios anuales de superficie y cosecha con un mismo ciclo productivo."],
["Limón",1.45,3.26,1.81,24396.8,-16.3,29,4,"Michoacán",8208.7,"La expansión de la cuota requiere distinguir limón mexicano, persa e italiano. La mezcla varietal puede modificar el precio agregado sin mostrar qué parte de la variación procede de cada mercado."],
["Frambuesa",0.08,1.34,1.26,8544.0,-33.4,34,2,"Jalisco",4335.0,"Parte de una base relativa pequeña y gana relevancia sostenida. El crecimiento de valor por hectárea puede concentrarse en poca superficie; el retroceso reciente obliga a distinguir trayectoria de coyuntura."],
["Fresa",0.64,1.89,1.25,15803.4,-8.6,39,2,"Michoacán",8708.5,"El cultivo combina registros expresados en toneladas y plantas. Todo el valor entra al ranking, pero volumen, precio y rendimiento solo son comparables dentro de una misma unidad física."],
["Caña de azúcar",8.23,6.19,-2.05,56055.5,10.8,44,1,"Veracruz",20765.4,"Una cuota menor puede coexistir con mayor valor nominal y con el aumento de 2025. La participación disminuye porque el conjunto agrícola se reestructura; no equivale a desaparición del cultivo."],
["Pastos y praderas",6.14,4.24,-1.90,37134.6,-3.2,49,20,"Jalisco",12177.7,"Es un agregado heterogéneo de usos forrajeros y variedades. El valor nacional puede cambiar por combinación de registros, por lo que no se infiere productividad homogénea de cada parcela."],
["Sorgo grano",4.09,2.37,-1.72,16601.9,-13.7,54,2,"Tamaulipas",6722.7,"La menor participación exige separar cambios de superficie, rendimiento y precio. El documento no demuestra sustitución causal por otros cultivos ni una presión concreta de costos."],
["Tomate rojo (jitomate)",5.51,3.99,-1.52,29602.3,-21.0,59,9,"San Luis Potosí",4410.3,"La reducción de cuota no demuestra rezago tecnológico. Coexisten cielo abierto, invernadero y malla sombra; la composición por variedad puede alterar valor y rendimiento medios."],
["Papa",3.55,2.20,-1.35,19064.2,-5.9,64,5,"Sonora",5692.8,"La comparación separa escala física y valor nominal. La composición de ciclos y variedades afecta el rendimiento agregado; no representa la experiencia uniforme de todos los productores."]
];
const cropFacts=[{"irrigation":47.2,"export":0,"states":[["Michoacán",44132.5],["Jalisco",8567.2],["México",2441.5]],"varieties":[["Aguacate hass",58801.6],["Aguacate criollo",679.2],["Aguacate fuerte",108.9]]},{"irrigation":13.7,"export":0,"states":[["Jalisco",7557.6],["Guanajuato",2945.5],["Michoacán",2439.8]],"varieties":[["Agave tequilero",13573.2],["Agave mezcalero",2187.7],["Agave bacanora",37.7]]},{"irrigation":70.9,"export":0.2,"states":[["Michoacán",8208.7],["Veracruz",5454.2],["Colima",3178.1]],"varieties":[["Limón agrio (mexicano)",12440.3],["Limón persa",10563.1],["Limón italiano",1393.4]]},{"irrigation":99.9,"export":60.4,"states":[["Jalisco",4335],["Baja California",2335.1],["Michoacán",1592.7]],"varieties":[["Frambuesa",8501.4],["Frambuesa s/clasificar",42.7]]},{"irrigation":99.9,"export":30.8,"states":[["Michoacán",8708.5],["Baja California",4387.1],["Guanajuato",1469.2]],"varieties":[["Fresa",12847],["Fresa s/clasificar",2956.3]]},{"irrigation":53.8,"export":0,"states":[["Veracruz",20765.4],["Jalisco",8657.6],["San Luis Potosí",5456.7]],"varieties":[["Caña de azúcar industrial",56055.5]]},{"irrigation":13,"export":0,"states":[["Jalisco",12177.7],["Oaxaca",9044.2],["Yucatán",3378.9]],"varieties":[["Pastos y praderas estrella",14581.8],["Pastos y praderas llanero",10608.1],["Pastos y praderas bermuda",4298.6]]},{"irrigation":41.9,"export":0,"states":[["Tamaulipas",6722.7],["Guanajuato",3883.1],["Michoacán",1327.6]],"varieties":[["Sorgo grano s/clasificar",16601.9],["Sorgo grano blanco",0]]},{"irrigation":97.8,"export":23.9,"states":[["San Luis Potosí",4410.3],["Sinaloa",3701.4],["Baja California Sur",2186.9]],"varieties":[["Tomate rojo (jitomate) saladette",23029.6],["Tomate rojo (jitomate) bola",4351.6],["Tomate rojo (jitomate) cherry",1015]]},{"irrigation":76.8,"export":0,"states":[["Sonora",5692.8],["Sinaloa",4766.1],["Nuevo León",1527]],"varieties":[["Papa alpha (blanca)",18395.8],["Papa s/clasificar",319.7],["Papa fianna (blanca)",280.6]]}];
const states=[
["Michoacán",7.905,12.803,4.899,104321.5,77,"Aguacate, maíz grano y fresa explican 60,7 % del valor territorial de 2025."],
["Jalisco",7.907,12.020,4.113,82669.5,78,"Destacan maíz grano, pastos y praderas y caña de azúcar. Agave y aguacate contribuyen positivamente al cambio de cuota."],
["Sonora",5.156,6.368,1.212,43981.9,79,"Los cultivos de mayor valor son uva, espárrago y papa. Su trayectoria combina cambios de composición y magnitudes físicas."],
["Chihuahua",5.079,6.290,1.211,50841.8,80,"La mejora relativa se calcula sobre toda la agricultura declarada, no únicamente sobre los diez cultivos seleccionados."],
["Campeche",0.476,0.979,0.503,7814.8,81,"La variación de cuota parte de un peso nacional reducido y debe compararse junto a la estructura de cultivos registrada."],
["Chiapas",5.859,2.730,-3.129,24196.7,82,"La pérdida de participación nacional es relativa: no acredita por sí sola una caída nominal de cada cultivo ni un deterioro causal."],
["Tamaulipas",4.332,2.708,-1.624,22132.6,83,"La relevancia relativa disminuye en la comparación de trienios; el balance depende de mezcla de cultivos y precios."],
["Sinaloa",8.647,7.227,-1.421,49615.2,84,"La caída de cuota nacional de largo plazo convive con una aportación agrícola elevada. Se puede complementar con los 18 perfiles del observatorio de Sinaloa."],
["México",4.945,3.846,-1.099,32011.8,85,"El ranking describe la participación de la entidad federativa denominada México, no el país."],
["Baja California",3.568,2.670,-0.898,18813.4,86,"Cambios de división municipal y de composición productiva requieren atención al revisar series largas."]
];
const munis=[
["Zapotlán el Grande","Jalisco",0.112,0.498,0.386,4078.9,87,"Aguacate, frambuesa y arándano concentran 87,9 % del valor municipal de 2025."],
["Jocotepec","Jalisco",0.132,0.473,0.341,2143.4,88,"La frambuesa ocupa la primera posición, seguida de zarzamora y maíz grano."],
["Caborca","Sonora",0.579,0.898,0.320,7604.3,89,"Espárrago, uva y papa son los tres mayores componentes del valor agrícola de 2025."],
["Salvador Escalante","Michoacán",0.253,0.565,0.311,4511.5,90,"El aguacate concentra la mayor parte del valor del cierre, acompañado de zarzamora y arándano."],
["Ario","Michoacán",0.280,0.590,0.310,5043.2,91,"El aguacate es el componente predominante en la estructura de valor municipal."],
["Mapastepec","Chiapas",0.987,0.114,-0.874,954.0,92,"La pérdida de participación refleja en gran medida la variación de pastos y praderas; no se interpreta automáticamente como caída de productividad."],
["Ensenada","Baja California",2.228,1.372,-0.855,9843.3,93,"ADVERTENCIA: el territorio publicado no mantiene límites constantes después de la creación de San Quintín; no debe leerse como declive sobre una unidad geográfica idéntica."],
["Guasave","Sinaloa",1.904,1.185,-0.719,8333.3,94,"La menor cuota nacional es compatible con un valor nominal municipal elevado. El detalle del cultivo está en la sección de Sinaloa."],
["Altamira","Tamaulipas",0.593,0.117,-0.475,935.2,95,"La caída de cuota nacional no identifica por sí sola una causa productiva concreta ni permite inferir utilidades."],
["González","Tamaulipas",0.597,0.229,-0.368,2303.4,96,"La estructura y los límites de la fuente requieren cautela para una interpretación municipal de largo plazo."]
];
const stateFacts=[{"share":60.7,"top":[["Aguacate",44132.5],["Maíz grano",10469.2],["Fresa",8708.5]]},{"share":46.7,"top":[["Maíz grano",17765.2],["Pastos y praderas",12177.7],["Caña de azúcar",8657.6]]},{"share":54.4,"top":[["Uva",11034.4],["Espárrago",7200.5],["Papa",5692.8]]},{"share":46.5,"top":[["Nuez",8400.7],["Manzana",7816.4],["Alfalfa",7418.5]]},{"share":63.9,"top":[["Maíz grano",2882.1],["Palma africana o de aceite",1073.9],["Soya",1037]]},{"share":52.7,"top":[["Maíz grano",7660.1],["Caña de azúcar",2934.1],["Café cereza",2147.2]]},{"share":60.8,"top":[["Sorgo grano",6722.7],["Naranja",4529.7],["Maíz grano",2211.5]]},{"share":52.2,"top":[["Maíz grano",13213.4],["Chile (verde y seco)",7664.8],["Frijol",5011.8]]},{"share":47.8,"top":[["Maíz grano",10425.9],["Aguacate",2441.5],["Crisantemo",2418.9]]},{"share":46.5,"top":[["Fresa",4387.1],["Frambuesa",2335.1],["Alfalfa",2034.2]]}];
const muniFacts=[{"share":87.9,"top":[["Aguacate",1785],["Frambuesa",1361.2],["Arándano",439.4]]},{"share":91.6,"top":[["Frambuesa",1488.3],["Zarzamora",304.3],["Maíz grano",170.4]]},{"share":93.2,"top":[["Espárrago",3637.4],["Uva",2891.9],["Papa",557.1]]},{"share":97.4,"top":[["Aguacate",4135.2],["Zarzamora",143.5],["Arándano",117.8]]},{"share":97.8,"top":[["Aguacate",4641],["Zarzamora",206.7],["Maíz grano",83.4]]},{"share":93.8,"top":[["Pastos y praderas",480.3],["Palma africana o de aceite",341.7],["Mango",73.2]]},{"share":76.9,"top":[["Fresa",4387.1],["Frambuesa",2335.1],["Arándano",846.2]]},{"share":65.8,"top":[["Maíz grano",2929.4],["Papa",1308.9],["Frijol",1246.5]]},{"share":69.1,"top":[["Sorgo grano",276.2],["Soya",214.9],["Chile (verde y seco)",155]]},{"share":57.1,"top":[["Sorgo grano",672.5],["Chile (verde y seco)",358.6],["Cebolla",283.4]]}];
const fmt=new Intl.NumberFormat('es-MX',{minimumFractionDigits:1,maximumFractionDigits:1});
const fmtpp=new Intl.NumberFormat('es-MX',{minimumFractionDigits:2,maximumFractionDigits:3});
const toNum=x=>fmt.format(x);
const pp=x=>(x>0?'+':'')+fmtpp.format(x)+' pp';
const qs=s=>document.querySelector(s);
const formatSource=p=>'Informe nacional · pág. '+p;
const sourceNote='<strong>Alcance:</strong> este expediente resume el PDF recibido. No representa la totalidad de observaciones estatales o municipales ni una revisión independiente de sus cálculos.';
function metrics(items){return '<div class="mx-metric-row">'+items.map(([title,value])=>'<div class="mx-metric"><small>'+title+'</small><strong>'+value+'</strong></div>').join('')+'</div>';}
function fold(title,html){return '<details class="mx-fold"><summary>'+title+'</summary>'+html+'</details>';}
function bar(rows,selection,selector){
 const max=Math.max(...rows.map(r=>Math.abs(r[3])));
 return rows.map((r,i)=>{
   const val=r[3],portion=Math.min(100,Math.abs(val)/max*96);
   return '<div class="mx-bar-row"><button type="button" class="mx-name" data-row="'+i+'">'+r[0]+'</button><div class="mx-bar-track">'+(val<0?'<div class="mx-bar-negative" style="width:'+portion+'%"></div><div></div>':'<div></div><div class="mx-bar-positive" style="width:'+portion+'%"></div>')+'</div><span class="mx-bar-number">'+pp(val)+'</span></div>';
 }).join('');
}
function miniNationalBars(rows,total){
 return '<div class="mx-small-bars">'+rows.map(([name,value])=>{
  const share=total>0?value/total*100:0;
  return '<div class="mx-small-bar-row"><span>'+name+'</span><div class="mx-small-bar-track"><span class="mx-small-bar-fill" style="width:'+Math.max(0,Math.min(100,share)).toFixed(2)+'%"></span></div><span>'+toNum(value)+' M$ <small>'+fmt.format(share)+' %</small></span></div>';
 }).join('')+'</div>';
}
function renderCrop(i){
 const r=crops[i];const [name,start,end,delta,val,annual,p,varieties,leader,leadValue,summary]=r;
 qs('#mx-crop-select').value=String(i);
 const description=delta>0?'Gana participación en el valor nacional':'Pierde participación en el valor nacional';
 qs('#mx-crop-detail').innerHTML='<div class="mx-detail-top"><div><span class="eyebrow">PERFIL CULTIVO · '+description.toUpperCase()+'</span><h4>'+name+'</h4></div><span class="mx-source">'+formatSource(p)+'–'+(p+4)+'</span></div>'+
 metrics([['Cuota inicial 2003–05',fmtpp.format(start)+' %'],['Cuota final 2023–25',fmtpp.format(end)+' %'],['Cambio de relevancia',pp(delta)],['Valor bruto 2025',toNum(val)+' M$']])+
 '<p class="mx-narrative">'+summary+'</p>'+
 fold('Cierre 2025 y comparación reciente','<p>Variación nominal 2025 frente a 2024: <strong>'+fmt.format(annual)+' %</strong>. El signo de la variación anual no tiene que coincidir con el cambio relativo de largo plazo. Fuente: página '+p+'.</p>')+
 fold('Variedades y concentración territorial','<p>El informe contabiliza <strong>'+varieties+' variedades o clasificaciones</strong> para este cultivo. En 2025 la entidad líder fue <strong>'+leader+'</strong>, con <strong>'+toNum(leadValue)+' millones de pesos</strong>. Los detalles se presentan en las páginas '+(p+2)+' y 100–110. Las etiquetas varietales no equivalen necesariamente a genotipos.</p>')+

 fold('Concentración territorial · tres estados principales',
 '<p>En el cierre 2025, las tres primeras entidades del cuadro de la página '+(p+2)+' son:</p>'+miniNationalBars(cropFacts[i].states,val)+'<p>Las participaciones se calculan contra el valor bruto nominal nacional de este cultivo, no contra la producción total de cada estado.</p>')+
 fold('Variedades principales · cierre 2025',
 '<p>Inventario parcial mostrado en el perfil; el informe contiene las demás variedades, incluidas categorías sin clasificar. Los montos son valores nominales de 2025.</p>'+miniNationalBars(cropFacts[i].varieties,val)+'<p>Riego: '+fmt.format(cropFacts[i].irrigation)+' % del valor; mercado clasificado como exportación: '+fmt.format(cropFacts[i].export)+' %. Son categorías declaradas por la fuente, no mediciones de consumo hídrico ni ventas aduaneras.</p>')+
 fold('Lectura económica y método','<p>'+description+'. La variación en el valor bruto nominal reúne superficie, volumen, precios y composición. No estima ganancia neta, valor real ni un efecto causal. El capítulo contiene análisis físico, lectura territorial, interpretación económica y balance varietal en las páginas '+p+'–'+(p+4)+'.</p>');
}
function renderState(i){
 const r=states[i];const [name,start,end,delta,val,p,note]=r;
 qs('#mx-state-select').value=String(i);
 qs('#mx-state-detail').innerHTML='<div class="mx-detail-top"><div><span class="eyebrow">PERFIL ESTATAL · '+(delta>0?'AUMENTO':'REDUCCIÓN')+' DE CUOTA</span><h4>'+name+'</h4></div><span class="mx-source">'+formatSource(p)+'</span></div>'+
 metrics([['Cuota inicial',fmtpp.format(start)+' %'],['Cuota final',fmtpp.format(end)+' %'],['Diferencia',pp(delta)],['Valor 2025',toNum(val)+' M$']])+
 '<p class="mx-narrative">'+note+'</p>'+
 fold('Tres cultivos líderes del estado en 2025','<p>Los tres cultivos representan <strong>'+fmt.format(stateFacts[i].share)+' %</strong> del valor bruto de '+name+'. Cifras reportadas en los cuadros de las páginas 70–71.</p>'+miniNationalBars(stateFacts[i].top,val)+'<p>La concentración describe una estructura de valor, no poder de mercado ni rentabilidad.</p>')+
 fold('Interpretación y composición','<p>La cuota se calcula frente al total agrícola nacional observado. Una reducción de participación no equivale automáticamente a una reducción del valor bruto ni a menor rentabilidad. La selección incluye todos los cultivos de la entidad y no solo los diez perfiles del informe. '+sourceNote+'</p>')+
 (name==='Sinaloa'?'<p class="mx-narrative"><a href="#municipios">Continuar con los 18 municipios de Sinaloa →</a></p>':'');
}
function renderMuni(i){
 const r=munis[i];const [name,ent,start,end,delta,val,p,note]=r;
 qs('#mx-muni-select').value=String(i);
 qs('#mx-muni-detail').innerHTML='<div class="mx-detail-top"><div><span class="eyebrow">PERFIL MUNICIPAL · '+ent.toUpperCase()+'</span><h4>'+name+'</h4></div><span class="mx-source">'+formatSource(p)+'</span></div>'+
 metrics([['Cuota inicial',fmtpp.format(start)+' %'],['Cuota final',fmtpp.format(end)+' %'],['Diferencia',pp(delta)],['Valor 2025',toNum(val)+' M$']])+
 '<p class="mx-narrative">'+note+'</p>'+
 fold('Tres cultivos líderes en 2025','<p>Los tres principales representan <strong>'+fmt.format(muniFacts[i].share)+' %</strong> del valor agrícola bruto del municipio. Fuente: páginas 74–75.</p>'+miniNationalBars(muniFacts[i].top,val)+'<p>Los cambios de cuota nacional no demuestran una mejora o pérdida de rentabilidad.</p>')+
 fold('Geografía, cuota y comparabilidad','<p>Las cuotas se miden frente al valor nacional. Son resultados de claves municipales publicadas y no de polígonos geográficos necesariamente constantes. Los cambios de demarcación pueden alterar series históricas; el informe no identifica efectos causales. '+sourceNote+'</p>')+
 (ent==='Sinaloa'?'<p class="mx-narrative"><a href="#municipios" data-open-sinaloa="Guasave">Abrir expediente municipal de Guasave en Sinaloa →</a></p>':'');
}
function renderQuality(){
 qs('#mx-quality').innerHTML='<div class="mx-quality-grid"><article><h4>Definición económica</h4><p>Participación anual: 100 × V(i,t)/V(nacional,t). Relevancia: diferencia entre la media de participaciones de 2023–2025 y 2003–2005. La selección exige 0,5 % en al menos uno de los dos trienios para los diez cultivos; estados y municipios se ordenan por su variación de cuota.</p></article><article><h4>Auditoría documentada</h4><p>El PDF declara 879.785 filas, 23 columnas y 32 entidades. Informa 0 faltantes, 0 duplicados exactos, 4 repeticiones dimensionales adicionales y dos registros con superficie cosechada mayor que sembrada. La auditoría incorporada informa 79 diferencias de valor bajo su tolerancia; la revisión independiente registra 115 diferencias relativas superiores al 1 % (58 superiores al 5 %). Son criterios distintos, no resultados recalculados por esta plataforma. Son resultados reportados, no recalculados aquí.</p></article><article><h4>Cobertura 2020–2021</h4><p>El número de nombres de cultivo observados cae a 78 en ambos años, desde 289 en 2019. No interpolar, no convertir años sin registro en producción cero, y evitar conectar estos valores como si la cobertura fuera constante.</p></article><article><h4>Territorio y unidades</h4><p>El informe declara 2.452 claves municipales a lo largo del periodo; el número observado varía anualmente. Los volúmenes solo se agregan dentro de una unidad física compatible. Ensenada presenta una ruptura territorial asociada a San Quintín; no se interpreta sobre límites constantes.</p></article></div>'+
 fold('Valoración nominal y causalidad','<p>Los 812.156,8 millones de pesos de 2025 no se encuentran deflactados. El valor bruto no equivale a margen, utilidad, empleo o productividad total. Las clasificaciones de exportación y orgánico son atributos de los registros, no certificaciones independientes.</p>')+
 fold('Conciliación del documento','<p>El reporte afirma haber contrastado 23 archivos anuales municipales de datos abiertos DGSIAP y señala diferencias monetarias acotadas por precisión de publicación (pp. 113–114). En esta integración no se ha repetido esa descarga ni cotejado sus 879.785 filas con el ZIP original.</p>')+
 fold('Comprobación de discrepancias y fuente','<p>Informe nacional, páginas 10 y 113: 79 registros superan la tolerancia de valor del manifiesto del paquete, mientras 115 tienen una diferencia relativa superior al 1 % según la comprobación independiente (58 superan el 5 %). Hay 4 repeticiones de clave dimensional y dos filas de pastos en Oaxaca, 2025, con cosechada mayor que sembrada. La conciliación con los 23 CSV municipales abiertos se describe en la página 114; esta web no la ejecuta porque falta el ZIP completo en el proyecto.</p>')+
 fold('Catálogos no homogéneos','<p>La auditoría advierte que el grupo denominado Chile (verde y seco) combina productos, que la alfalfa puede reunir presentaciones distintas y que fresa incluye registros en toneladas y plantas. No deben compararse rendimientos entre unidades físicas diferentes.</p>');
}
function exportReportRows(rows,filename,cols){
 const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const lines=[cols.map(c=>esc(c[0])).join(','),...rows.map(r=>cols.map(c=>esc(r[c[1]])).join(','))];
 const file=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
window.GrowaNationalData=Object.freeze({crops:crops,states:states,munis:munis,cropFacts:cropFacts,stateFacts:stateFacts,muniFacts:muniFacts});
function initNational(){
 const total=812156.8,initial=192420.5;
 qs('#mx-kpis').innerHTML=[
 ['Valor agrícola 2025',toNum(total)+' M$','Bruto nominal · página 3'],
 ['Variación desde 2003',fmt.format((total/initial-1)*100)+' %','No implica aumento real'],
 ['Superficie cosechada',toNum(19117034/1e6)+' M ha','Acumulación por cultivo y ciclo'],
 ['Caída del valor en 2025','−43.620,4 M$','Frente a 2024 · −5,1 %']
 ].map(([name,value,foot])=>'<div class="national-kpi"><span>'+name+'</span><strong>'+value+'</strong><small>'+foot+'</small></div>').join('');
 [['crop',crops,'#mx-crop-select'],['state',states,'#mx-state-select'],['muni',munis,'#mx-muni-select']].forEach(([kind,arr,sel])=>{
   const s=qs(sel);s.innerHTML=arr.map((r,i)=>'<option value="'+i+'">'+r[0]+(kind==='muni'?' · '+r[1]:'')+'</option>').join('');
 });
 const prep=(which,rows,container,fn,sel)=>{
  const host=qs(container);host.innerHTML=bar(rows);
  host.querySelectorAll('[data-row]').forEach(b=>b.addEventListener('click',()=>fn(+b.dataset.row)));
  qs(sel).addEventListener('change',e=>fn(+e.target.value));
 };
 prep('crop',crops,'#mx-crops-chart',renderCrop,'#mx-crop-select');
 prep('state',states,'#mx-states-chart',renderState,'#mx-state-select');
 const muniBar=munis.map(m=>[m[0]+' · '+m[1],m[2],m[3],m[4],m[5]]);
 const host=qs('#mx-munis-chart');host.innerHTML=bar(muniBar);host.querySelectorAll('[data-row]').forEach(b=>b.addEventListener('click',()=>renderMuni(+b.dataset.row)));qs('#mx-muni-select').addEventListener('change',e=>renderMuni(+e.target.value));
 renderCrop(0);renderState(0);renderMuni(0);renderQuality();

 const nationalMuniDetail=qs('#mx-muni-detail');
 nationalMuniDetail.addEventListener('click',event=>{
  const link=event.target.closest('[data-open-sinaloa]');
  if(!link)return;
  event.preventDefault();
  const select=document.getElementById('municipio');
  if(select){select.value=link.dataset.openSinaloa;select.dispatchEvent(new Event('change',{bubbles:true}));}
  location.hash='#municipios';
 });
 document.querySelectorAll('[data-mx-export]').forEach(button=>button.addEventListener('click',()=>{
  const kind=button.dataset.mxExport;
  const rows=(kind==='cultivos'?crops:kind==='estados'?states:munis).map(r=>kind==='municipios'?
    {nombre:r[0],entidad:r[1],cuota_inicio:r[2],cuota_final:r[3],cambio_pp:r[4],valor_2025_mdp:r[5],pagina:r[6]}:
    {nombre:r[0],cuota_inicio:r[1],cuota_final:r[2],cambio_pp:r[3],valor_2025_mdp:r[4],pagina:kind==='cultivos'?r[6]:r[5]});
  const cols=kind==='municipios'?[['Municipio','nombre'],['Entidad','entidad'],['Cuota inicial (%)','cuota_inicio'],['Cuota final (%)','cuota_final'],['Cambio (pp)','cambio_pp'],['Valor 2025 (M$)','valor_2025_mdp'],['Página del informe','pagina']]:
    [['Nombre','nombre'],['Cuota inicial (%)','cuota_inicio'],['Cuota final (%)','cuota_final'],['Cambio (pp)','cambio_pp'],['Valor 2025 (M$)','valor_2025_mdp'],['Página del informe','pagina']];
  exportReportRows(rows,'growa_mexico_'+kind+'_resumen_informe_2025.csv',cols);
 }));
 document.querySelectorAll('[data-mx-tab]').forEach(b=>b.addEventListener('click',()=>{
   document.querySelectorAll('[data-mx-tab]').forEach(x=>x.classList.toggle('active',x===b));
   document.querySelectorAll('[data-mx-panel]').forEach(x=>x.hidden=x.dataset.mxPanel!==b.dataset.mxTab);
 }));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initNational);else initNational();
})();


/* GROWA PRO UX ENGINE
   Contextual controls, bookmarked dossiers, deep links and keyboard-accessible
   interactive drill-downs; original Sinaloa data remain unmodified. */
(function(){
'use strict';
var key='growa-agricultura-ui-v1',savedKey='growa-agricultura-bookmarks-v1';
var $=function(id){return document.getElementById(id)};
var pageNames={panorama:'Inicio · Observatorio agrícola','explorar-estados':'Explorar estados','explorar-cultivos':'Explorar cultivos',laboratorio:'Laboratorio económico',municipios:'Expedientes municipales',cultivos:'Cultivos y variedades',mexico:'México · investigación nacional',metodologia:'Fuentes y metodología'};
var lastFocus=null,noticeTimer=null,initialized=false,restored=false,filters={};
function readJSON(key,def){try{var value=JSON.parse(localStorage.getItem(key));return value===null?def:value}catch(e){return def}}
function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
function tab(){var current=document.querySelector('.nav-link.active');return current?current.dataset.tab:'panorama'}
function activePanel(){return $('panel-'+tab())}
function val(id){var element=$(id);return element?element.value:''}
function notify(message){var el=$('ux-toast');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(function(){el.hidden=true},2800)}
function action(id,callback){var button=$(id);if(button)button.addEventListener('click',callback)}
function visibleFoldCount(){var active=activePanel();return active?active.querySelectorAll('details').length:0}
function refreshChrome(){
 var current=tab(),active=activePanel();
 if($('ux-view-title'))$('ux-view-title').textContent=pageNames[current]||current;
 if($('ux-fold-count'))$('ux-fold-count').textContent=String(visibleFoldCount());
 var snapshot=JSON.stringify(getSnapshot()),bookmarks=readJSON(savedKey,[]);
 var found=bookmarks.some(function(item){return JSON.stringify(item.snapshot)===snapshot});
 if($('ux-bookmark')){$('ux-bookmark').setAttribute('aria-pressed',found?'true':'false');$('ux-bookmark').textContent=found?'★ Vista guardada':'☆ Guardar vista'}
 if(active){document.querySelectorAll('.ux-workbench').forEach(function(x){x.classList.toggle('ux-national-mode',current==='mexico')})}
}
function toggleDetails(container,opening){
 if(!container)return;
 var all=Array.from(container.querySelectorAll('details'));
 all.forEach(function(d){d.open=opening});
 refreshChrome();
 notify((opening?'Abiertos ':'Contraídos ')+all.length+' apartados de análisis');
}
function getSnapshot(){
 var current=tab();
 var result={t:current};
 if(current==='municipios')result.m=val('municipio');
 if(current==='cultivos')result.c=val('cultivo');
 if(current==='panorama'){result.y=val('year-select');result.a=val('compare-a');result.b=val('compare-b')}
 if(current==='mexico'){
  var mx=document.querySelector('.mx-tab.active');result.x=mx?mx.dataset.mxTab:'cultivos';
  result.i=val(result.x==='cultivos'?'mx-crop-select':result.x==='estados'?'mx-state-select':'mx-muni-select');
 }
 return result;
}
function snapLabel(s){
 if(s.t==='municipios')return 'Municipio · '+s.m;
 if(s.t==='cultivos')return 'Cultivo · '+s.c;
 if(s.t==='panorama')return 'Panorama · '+s.y;
 if(s.t==='mexico')return 'México · '+({cultivos:'Cultivo',estados:'Entidad',municipios:'Municipio',auditoria:'Auditoría'}[s.x]||'Informe')+(s.i&&s.x!=='auditoria'?' #'+(Number(s.i)+1):'');
 return pageNames[s.t]||'Vista';
}
function toURL(snapshot){
 var u=new URL(location.href);
 u.searchParams.set('gw',JSON.stringify(snapshot));
 u.hash='#'+snapshot.t;
 return u;
}
function setSelect(id,value){
 var el=$(id);if(!el||value===undefined||value===null)return;
 var exists=Array.from(el.options||[]).some(function(option){return option.value===String(value)});
 if(!exists)return;
 if(el.value!==String(value)){el.value=String(value);el.dispatchEvent(new Event('change',{bubbles:true}))}
}
function restoreSnapshot(s){
 if(!s||!pageNames[s.t])return;
 var route=document.querySelector('.nav-link[data-tab="'+s.t+'"]');
 if(route)route.click();
 if(s.t==='municipios')setSelect('municipio',s.m);
 if(s.t==='cultivos')setSelect('cultivo',s.c);
 if(s.t==='panorama'){setSelect('year-select',s.y);setSelect('compare-a',s.a);setSelect('compare-b',s.b)}
 if(s.t==='mexico'){
  var t=document.querySelector('.mx-tab[data-mx-tab="'+(s.x||'cultivos')+'"]');
  if(t)t.click();
  var control=s.x==='estados'?'mx-state-select':s.x==='municipios'?'mx-muni-select':'mx-crop-select';
  setSelect(control,s.i);
 }
 refreshChrome();
}
function restoreFromURL(){
 if(restored)return;
 var encoded=new URL(location.href).searchParams.get('gw');
 if(encoded){try{var data=JSON.parse(encoded);restoreSnapshot(data)}catch(e){notify('No se pudo recuperar la vista del enlace')}}
 restored=true;
}
function ensureRestoration(){
 if(restored)return;
 var el=$('status');
 if(el&&el.textContent.indexOf('Datos cargados')!==-1)restoreFromURL();
}
function copyLink(){
 var url=toURL(getSnapshot()).toString();
 if(navigator.clipboard&&navigator.clipboard.writeText){
  navigator.clipboard.writeText(url).then(function(){notify('Enlace de la vista copiado')}).catch(function(){fallbackCopy(url)})
 }else fallbackCopy(url)
}
function fallbackCopy(value){
 var area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();var success=false;try{success=document.execCommand('copy')}catch(e){}area.remove();notify(success?'Enlace de la vista copiado':'Copia el enlace desde la barra del navegador');
}
function bookmarks(){var items=readJSON(savedKey,[]);return Array.isArray(items)?items.slice(0,30):[]}
function saveCurrent(){
 var data=getSnapshot(),items=bookmarks(),signature=JSON.stringify(data);
 var found=items.findIndex(function(item){return JSON.stringify(item.snapshot)===signature});
 if(found>=0){items.splice(found,1);notify('Vista retirada de guardados')}
 else{items.unshift({label:snapLabel(data),snapshot:data});items=items.slice(0,30);notify('Vista guardada en este navegador')}
 writeJSON(savedKey,items);renderSaved();refreshChrome();
}
function renderSaved(){
 var target=$('ux-saved-list'),items=bookmarks();if(!target)return;target.replaceChildren();
 if($('ux-saved-count'))$('ux-saved-count').textContent=String(items.length);
 if(!items.length){var empty=document.createElement('p');empty.className='ux-empty';empty.textContent='Todavía no has guardado ninguna vista.';target.append(empty);return}
 items.forEach(function(item,index){
  var row=document.createElement('div');row.className='ux-saved-item';
  var open=document.createElement('button');open.type='button';open.textContent=item.label;open.addEventListener('click',function(){
   restoreSnapshot(item.snapshot);history.replaceState(null,'',toURL(item.snapshot));closePanel();notify('Vista recuperada');
  });
  var remove=document.createElement('button');remove.type='button';remove.setAttribute('aria-label','Quitar '+item.label);remove.textContent='×';remove.addEventListener('click',function(){
   var list=bookmarks();list.splice(index,1);writeJSON(savedKey,list);renderSaved();refreshChrome()
  });
  row.append(open,remove);target.append(row);
 });
}
function showPanel(){
 var dialog=$('ux-dialog');if(!dialog)return;
 lastFocus=document.activeElement;
 renderSaved();dialog.hidden=false;document.body.style.overflow='hidden';
 var panel=dialog.querySelector('.ux-dialog-panel');if(panel)panel.focus()
}
function closePanel(){
 var el=$('ux-dialog');if(!el||el.hidden)return;
 el.hidden=true;document.body.style.overflow='';
 if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus();
}
function wide(on){
 document.body.classList.toggle('ux-focus',on);
 ['ux-focus','ux-setting-focus'].forEach(function(id){var b=$(id);if(b)b.setAttribute('aria-pressed',on?'true':'false')});
 if($('ux-focus'))$('ux-focus').textContent=on?'Salir de vista amplia ⛶':'Vista amplia ⛶';
 if($('ux-setting-focus'))$('ux-setting-focus').textContent=on?'Desactivar vista amplia':'Activar vista amplia';
 updatePrefs();notify(on?'Vista amplia activada':'Vista habitual restaurada')
}
function density(compact){
 document.body.classList.toggle('ux-compact',compact);
 ['ux-density-normal','ux-density-compact'].forEach(function(id){
  var b=$(id);if(b)b.setAttribute('aria-pressed',(id==='ux-density-compact'?compact:!compact)?'true':'false')
 });updatePrefs()
}
function updatePrefs(){writeJSON(key,{focus:document.body.classList.contains('ux-focus'),compact:document.body.classList.contains('ux-compact')})}
function fillTOC(){
 var target=$('ux-toc-menu'),panel=activePanel();if(!target||!panel)return;
 target.replaceChildren();
 var tag=document.createElement('span');tag.className='ux-overline';tag.textContent='SALTA A UNA SECCIÓN';target.append(tag);
 var selectors='.section-heading h2,.research-head h3,.section-card-heading h3,.story-heading h3,.national-panel-head h3,.mx-panel:not([hidden]) h4';
 var choices=Array.from(panel.querySelectorAll(selectors)).filter(function(h){
  var p=h.closest('[hidden]');return !p&&h.textContent.trim().length>0
 }).slice(0,18);
 choices.forEach(function(h,i){
  var button=document.createElement('button');button.type='button';button.textContent=String(i+1).padStart(2,'0')+' · '+h.textContent.trim();
  button.addEventListener('click',function(){
   var details=h.closest('details');if(details)details.open=true;closeTOC();h.scrollIntoView({behavior:'smooth',block:'start'})
  });target.append(button)
 });
 if(!choices.length){var p=document.createElement('p');p.textContent='No hay apartados adicionales en esta vista.';target.append(p)}
}
function closeTOC(){if($('ux-toc-menu'))$('ux-toc-menu').hidden=true;if($('ux-toc-toggle'))$('ux-toc-toggle').setAttribute('aria-expanded','false')}
function toggleTOC(){
 var menu=$('ux-toc-menu');if(!menu)return;
 if(menu.hidden){fillTOC();menu.hidden=false;$('ux-toc-toggle').setAttribute('aria-expanded','true')}
 else closeTOC()
}
function stepYear(direction){
 var el=$('year-select');if(!el)return;
 var options=Array.from(el.options).map(function(o){return Number(o.value)}).sort(function(a,b){return a-b});
 var present=Number(el.value),i=options.indexOf(present),next=options[i+direction];
 if(next===undefined)return;
 setSelect('year-select',next);notify('Cierre de '+next)
}
function swapMunicipalities(){
 var a=val('compare-a'),b=val('compare-b');
 setSelect('compare-a',b);setSelect('compare-b',a);
 notify('Se intercambiaron los municipios');
}
function reportPrint(){
 var section=activePanel();if(!section)return;
 if(tab()==='municipios')toggleDetails($('municipio-report'),true);
 window.print();
}
function getData(kind){var d=window.GrowaNationalData;if(!d)return[];return kind==='cultivos'?d.crops:kind==='estados'?d.states:d.munis}
function itemData(kind,row){
 var muni=kind==='municipios';
 return {name:row[0]+(muni?' · '+row[1]:''),start:row[muni?2:1],end:row[muni?3:2],delta:row[muni?4:3],value:row[muni?5:4],note:muni?row[7]:(kind==='estados'?row[6]:row[10])}
}
function cmpNumber(n,digits){return Number(n).toLocaleString('es-MX',{minimumFractionDigits:digits||1,maximumFractionDigits:digits||1})}
function compareCard(label,data){
 return '<article class="ux-ncmp-card"><div class="ux-overline">'+label+'</div><h5>'+data.name+'</h5>'+
 [['Cuota inicial',cmpNumber(data.start,2)+' %'],['Cuota final',cmpNumber(data.end,2)+' %'],['Cambio de cuota',(data.delta>0?'+':'')+cmpNumber(data.delta,2)+' pp'],['Valor 2025',cmpNumber(data.value,1)+' M$']].map(function(e){return '<div class="ux-ncmp-stat"><span>'+e[0]+'</span><strong>'+e[1]+'</strong></div>'}).join('')+
 '<p class="ux-ncmp-conclusion">'+(data.note||'Comparación de participaciones nacionales, no de rentabilidad.')+'</p></article>'
}
function nationalCompare(kind,container){
 var host=container.querySelector('.ux-national-comparison');if(!host)return;
 var rows=getData(kind);if(!rows.length)return;
 var a=host.querySelector('[data-side="a"]'),b=host.querySelector('[data-side="b"]'),grid=host.querySelector('.ux-ncmp-grid');
 [a,b].forEach(function(el){
  if(el.options.length)return;
  rows.forEach(function(r,i){var option=document.createElement('option');option.value=String(i);option.textContent=r[0]+(kind==='municipios'?' · '+r[1]:'');el.append(option)})
 });
 if(!b.dataset.ready){b.value=String(Math.min(5,rows.length-1));b.dataset.ready='1'}
 var first=itemData(kind,rows[Number(a.value)]),second=itemData(kind,rows[Number(b.value)]);
 grid.innerHTML=compareCard('FICHA A',first)+compareCard('FICHA B',second);
}
function setFilterMode(kind,container,mode){
 var state=filters[kind];if(!state)return;state.mode=mode;
 container.querySelectorAll('[data-filter-mode]').forEach(function(b){b.classList.toggle('active',b.dataset.filterMode===mode);b.setAttribute('aria-pressed',b.dataset.filterMode===mode?'true':'false')});
 refreshRanks(kind,container);
}
function refreshRanks(kind,panel){
 var state=filters[kind],chart=panel.querySelector('.mx-bar-chart');if(!state||!chart)return;
 var entries=Array.from(chart.querySelectorAll('.mx-bar-row'));
 entries.sort(function(a,b){
  var aName=a.querySelector('.mx-name')?.textContent||'',bName=b.querySelector('.mx-name')?.textContent||'';
  var av=parseInt(a.dataset.score||'0',10),bv=parseInt(b.dataset.score||'0',10);
  return state.sort==='name'?aName.localeCompare(bName,'es'):Math.abs(bv)-Math.abs(av);
 });
 entries.forEach(function(row){
  var v=Number(row.dataset.score);row.classList.toggle('ux-hidden-row',state.mode==='up'&&v<=0||state.mode==='down'&&v>=0);
  chart.append(row)
 });
 var count=entries.filter(function(row){return !row.classList.contains('ux-hidden-row')}).length;
 var tag=panel.querySelector('.ux-filter-count');if(tag)tag.textContent=count+' resultados · selección del informe';
}
function setupNationalFilter(kind){
 var panel=document.querySelector('.mx-panel[data-mx-panel="'+kind+'"]');if(!panel||panel.dataset.uxReady)return;
 var chart=panel.querySelector('.mx-bar-chart');if(!chart)return;
 var rows=Array.from(chart.querySelectorAll('.mx-bar-row'));
 if(!rows.length)return;
 rows.forEach(function(row){
  var raw=row.querySelector('.mx-bar-number')?.textContent||'0';
  var num=parseFloat(raw.replace('−','-').replace(/[^0-9.,+-]/g,'').replace(',','.'));
  row.dataset.score=String(Math.round((Number.isFinite(num)?num:0)*1000))
 });
 filters[kind]={mode:'all',sort:'impact'};
 var bar=document.createElement('div');bar.className='ux-rank-filters';bar.setAttribute('role','group');bar.setAttribute('aria-label','Filtrar y comparar ranking '+kind);
 bar.innerHTML='<button type="button" class="ux-filter-btn active" data-filter-mode="all" aria-pressed="true">Todos</button>'+
 '<button type="button" class="ux-filter-btn" data-filter-mode="up" aria-pressed="false">↑ Ganan cuota</button>'+
 '<button type="button" class="ux-filter-btn" data-filter-mode="down" aria-pressed="false">↓ Pierden cuota</button>'+
 '<button type="button" class="ux-filter-btn" data-sort-mode="name">A–Z</button>'+
 '<button type="button" class="ux-filter-btn" data-sort-mode="impact">Mayor cambio</button>'+
 '<button type="button" class="ux-filter-btn ux-comparison-control" data-open-ncmp="true">⇄ Comparar dos</button>'+
 '<span class="ux-filter-count">'+rows.length+' resultados</span>';
 panel.insertBefore(bar,chart);
 var comparison=document.createElement('div');comparison.className='ux-national-comparison';comparison.hidden=true;
 comparison.innerHTML='<div class="ux-compare-head"><h4>Comparación de dos fichas</h4><button type="button" data-close-ncmp="true" aria-label="Cerrar comparador">Cerrar ✕</button></div>'+
 '<div class="ux-national-selectors"><label>FICHA A<select data-side="a"></select></label><label>FICHA B<select data-side="b"></select></label></div>'+
 '<div class="ux-ncmp-grid"></div><p class="ux-rank-note">Datos publicados en el informe nacional de 115 páginas. La variación de cuota no identifica causalidad ni rentabilidad.</p>';
 panel.insertBefore(comparison,chart);
 bar.addEventListener('click',function(event){
  var b=event.target.closest('button');if(!b)return;
  if(b.dataset.filterMode){setFilterMode(kind,panel,b.dataset.filterMode);return}
  if(b.dataset.sortMode){filters[kind].sort=b.dataset.sortMode;bar.querySelectorAll('[data-sort-mode]').forEach(function(x){x.classList.toggle('active',x===b)});refreshRanks(kind,panel);return}
  if(b.dataset.openNcmp){comparison.hidden=false;nationalCompare(kind,panel);comparison.scrollIntoView({block:'nearest',behavior:'smooth'})}
 });
 comparison.addEventListener('change',function(){nationalCompare(kind,panel)});
 comparison.addEventListener('click',function(event){if(event.target.closest('[data-close-ncmp]'))comparison.hidden=true});
 panel.dataset.uxReady='1';refreshRanks(kind,panel)
}
function init(){
 if(initialized)return;initialized=true;
 var prefs=readJSON(key,{});
 document.body.classList.toggle('ux-focus',!!prefs.focus);
 document.body.classList.toggle('ux-compact',!!prefs.compact);
 density(!!prefs.compact);
 if(prefs.focus)wide(true);
 action('ux-open-panel',showPanel);action('ux-dialog-close',closePanel);action('ux-dialog-backdrop',closePanel);
 action('ux-toc-toggle',toggleTOC);
 action('ux-expand-all',function(){toggleDetails(activePanel(),true)});
 action('ux-collapse-all',function(){toggleDetails(activePanel(),false)});
 action('ux-open-report',function(){toggleDetails($('municipio-report'),true)});
 action('ux-close-report',function(){toggleDetails($('municipio-report'),false)});
 action('ux-open-crop-details',function(){toggleDetails($('crop-municipal-details'),true)});
 action('ux-close-crop-details',function(){toggleDetails($('crop-municipal-details'),false)});
 action('ux-report-print',reportPrint);
 action('ux-focus',function(){wide(!document.body.classList.contains('ux-focus'))});
 action('ux-setting-focus',function(){wide(!document.body.classList.contains('ux-focus'))});
 action('ux-density-normal',function(){density(false);notify('Densidad cómoda')});
 action('ux-density-compact',function(){density(true);notify('Densidad compacta')});
 action('ux-reset',function(){wide(false);density(false);notify('Presentación restablecida')});
 action('ux-copy-link',copyLink);action('ux-bookmark',saveCurrent);
 action('ux-year-prev',function(){stepYear(-1)});
 action('ux-year-next',function(){stepYear(1)});
 action('ux-compare-swap',swapMunicipalities);
 document.querySelectorAll('.nav-link,.mx-tab').forEach(function(button){button.addEventListener('click',function(){closeTOC();setTimeout(refreshChrome,0)})});
 document.querySelectorAll('#municipio,#cultivo,#year-select,#mx-crop-select,#mx-state-select,#mx-muni-select,#compare-a,#compare-b').forEach(function(element){element.addEventListener('change',refreshChrome)});
 document.addEventListener('click',function(event){
  if(!$('ux-toc-menu')?.hidden&&!event.target.closest('.ux-menu-anchor'))closeTOC();
  var more=document.querySelector('.ux-more-menu');if(more&&more.open&&!event.target.closest('.ux-more-menu'))more.open=false;
  if(event.target.closest('[data-row]'))setTimeout(refreshChrome,0)
 });
 document.addEventListener('keydown',function(event){
  if(event.key==='Escape'){closeTOC();closePanel();var more=document.querySelector('.ux-more-menu');if(more)more.open=false;return}
  var isTyping=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
  if(event.ctrlKey&&event.shiftKey&&event.key.toLowerCase()==='p'){event.preventDefault();showPanel();return}
  if(event.altKey&&!isTyping&&tab()==='panorama'){
   if(event.key==='ArrowLeft'){event.preventDefault();stepYear(-1)}
   if(event.key==='ArrowRight'){event.preventDefault();stepYear(1)}
  }
  if(!$('ux-dialog')?.hidden&&event.key==='Tab'){
   var candidates=Array.from($('ux-dialog').querySelectorAll('button,select,input,[tabindex]')).filter(function(x){return !x.disabled&&x.getClientRects().length>0});
   if(candidates.length){var first=candidates[0],last=candidates[candidates.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
  }
 });
 ['cultivos','estados','municipios'].forEach(setupNationalFilter);
 renderSaved();refreshChrome();
 window.addEventListener('hashchange',function(){closeTOC();setTimeout(refreshChrome,50)});
 var monitored=['municipio-report','crop-dimensions','crop-municipal-details'];
 monitored.forEach(function(id){var el=$(id);if(el)new MutationObserver(function(){refreshChrome()}).observe(el,{childList:true})});
 ensureRestoration();
 var status=$('status');if(status)new MutationObserver(ensureRestoration).observe(status,{childList:true,characterData:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


/* GROWA TWO EXPLORERS V1 */
(function(){
'use strict';
const by=id=>document.getElementById(id), safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=new Intl.NumberFormat('es-MX',{maximumFractionDigits:1}),pc=new Intl.NumberFormat('es-MX',{maximumFractionDigits:2,minimumFractionDigits:2});
const money=v=>Number.isFinite(v)?fmt.format(v)+' MDP':'';
const pct=v=>Number.isFinite(v)?(v>0?'+':'')+pc.format(v)+' %':'';
const sum=r=>r.reduce((t,v)=>t+(Number(v.value)||0),0);
const enc=v=>encodeURIComponent(v),dec=v=>decodeURIComponent(v);
let D,R,N,ready=false;
const x={entity:'Sinaloa',municipio:'',stateCrop:'',stateYear:2025,stateMode:'evolucion',scope:'sinaloa',crop:'Maíz grano',cropMuni:'',cropYear:2025,cropVar:'',cropDim:'Nomvariedad',cropMode:'evolucion'};
const ys=()=>Array.from({length:23},(_,i)=>2025-i);
function bar(rows,tot,action,n=20){
 const max=Math.max(1,...rows.map(r=>r.value));
 return rows.length?'<div class="gx-bars">'+rows.slice(0,n).map(r=>'<div class="gx-bar"><div class="gx-bar-top">'+(action?'<button data-gx-action="'+action+'" data-gx-value="'+enc(r.name)+'" type="button">'+safe(r.name)+' ↗</button>':'<span>'+safe(r.name)+'</span>')+'<strong>'+money(r.value)+'</strong></div><div class="gx-bar-track"><span style="width:'+(r.value/max*100).toFixed(2)+'%"></span></div><small>'+pc.format(tot?r.value/tot*100:0)+' % de esta selección</small></div>').join('')+'</div>':'<p class="gx-empty">No existen observaciones para la selección.</p>';
}
function aggregate(rows,key){const m=new Map();rows.forEach(r=>{const k=String(r[key]||'Sin clasificar');m.set(k,(m.get(k)||0)+(r.value||0))});return [...m].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)}
function field(id,label,options,current){return '<label class="gx-field">'+safe(label)+'<select id="'+id+'">'+options.map(([v,n])=>'<option value="'+safe(v)+'"'+(String(v)===String(current)?' selected':'')+'>'+safe(n)+'</option>').join('')+'</select></label>'}
function kpi(name,val,desc){if(val===null||val===undefined||!String(val).trim()||/^(s\/d|s\/r|n\/d|sin registro|sin comparación|—)$/i.test(String(val).trim()))return '';return '<div class="gx-kpi"><span>'+safe(name)+'</span><strong>'+safe(val)+'</strong><small>'+safe(desc)+'</small></div>'}
function header(title,eyebrow,status){return '<div class="gx-result-head"><div><span class="gx-eyebrow">'+safe(eyebrow)+'</span><h3>'+safe(title)+'</h3></div><span class="gx-status">'+safe(status)+'</span></div>'}
function modes(kind,items,selected){return '<div class="gx-modebar" role="group" aria-label="Tipo de análisis">'+items.map(([k,v])=>'<button type="button" data-gx-mode="'+kind+'" data-gx-mode-value="'+k+'" class="'+(k===selected?'active':'')+'" aria-pressed="'+(k===selected)+'">'+v+'</button>').join('')+'</div>'}
function intro(title,note){return '<div class="gx-part-title"><h4>'+safe(title)+'</h4><span>'+safe(note)+'</span></div>'}
function download(name,rows){if(rows.length)window.GrowaDownloadCSV(name,rows)}
function series(filter){const m=new Map();D.crops.filter(filter).forEach(r=>m.set(r.year,(m.get(r.year)||0)+r.value));return [...m].map(([year,value])=>({year,value})).sort((a,b)=>a.year-b.year)}
function stateOptions(){return N.states.map(r=>r[0]).sort((a,b)=>a==='Sinaloa'?-1:b==='Sinaloa'?1:a.localeCompare(b,'es'))}
function drawStateChoices(){
 const term=by('gx-state-search').value.toLocaleLowerCase('es');
 by('gx-state-list').innerHTML=stateOptions().filter(n=>n.toLocaleLowerCase('es').includes(term)).map(n=>'<button type="button" class="gx-choice'+(x.entity===n?' active':'')+'" data-gx-entity="'+enc(n)+'"><span>'+safe(n)+'</span><small>'+(n==='Sinaloa'?'DETALLE HISTÓRICO':'PERFIL DEL INFORME')+'</small></button>').join('')||'<p class="gx-empty">Sin coincidencias entre los perfiles disponibles.</p>';
}
function renderState(){
 if(!ready)return;drawStateChoices();
 const sv=by('gx-state-view'),dv=by('gx-state-deep');
 if(x.entity!=='Sinaloa'){
  const i=N.states.findIndex(r=>r[0]===x.entity),r=N.states[i],info=N.stateFacts[i];
  if(!r)return;
  sv.innerHTML=header(r[0],'PERFIL ESTATAL / MÉXICO','Solo resumen del PDF')+
  '<p class="gx-lede">'+safe(r[6])+'</p><div class="gx-kpis">'+kpi('Valor 2025',money(r[4]),'Millones nominales')+kpi('Cuota inicial',pc.format(r[1])+' %','Promedio 2003–2005')+kpi('Cuota reciente',pc.format(r[2])+' %','Promedio 2023–2025')+kpi('Cambio',(r[3]>0?'+':'')+pc.format(r[3])+' pp','Cambio relativo')+'</div>'+
  '<div class="gx-warning">Perfil del informe nacional, página '+r[5]+'. No hay microdatos anuales, municipales o varietales completos para esta entidad en la plataforma.</div>';
  dv.innerHTML=intro('Principales cultivos','CIERRE 2025')+bar(info.top.map(a=>({name:a[0],value:a[1]})),r[4],null,3)+
  '<div class="gx-method"><strong>Alcance de esta consulta</strong><p>Las cuotas se calculan respecto al valor nacional observado. No representan crecimiento real, rentabilidad ni causalidad. Sinaloa es la única entidad con expedientes municipales y series detalladas integrados hasta ahora.</p></div>';
  return;
 }
 const all=D.crops.filter(r=>!x.municipio||r.municipio===x.municipio);
 const names=[...new Set(all.map(r=>r.name))].sort((a,b)=>a.localeCompare(b,'es'));
 if(x.stateCrop&&!names.includes(x.stateCrop))x.stateCrop='';
 const filter=r=>(!x.municipio||r.municipio===x.municipio)&&(!x.stateCrop||r.name===x.stateCrop);
 let history;
 if(!x.municipio&&!x.stateCrop)history=D.state.map(r=>({year:r.year,value:r.value}));
 else if(x.municipio&&!x.stateCrop)history=D.municipalities.filter(r=>r.name===x.municipio).map(r=>({year:r.year,value:r.value}));
 else history=series(filter);
 const curr=history.find(r=>r.year===x.stateYear),last=history.find(r=>r.year===x.stateYear-1);
 const rows=D.crops.filter(r=>r.year===x.stateYear&&filter(r)),yearTotal=D.state.find(r=>r.year===x.stateYear)?.value||0;
 const nom=curr?.value??null,change=curr&&last?.value>0?(curr.value/last.value-1)*100:null;
 sv.innerHTML=header('Sinaloa','ESTADO / SERIE 2003–2025','Datos detallados')+
 '<p class="gx-lede">Explora un municipio y después un cultivo. El año elegido actualiza los indicadores y rankings; las gráficas conservan los años realmente registrados.</p>'+
 '<div class="gx-filters">'+field('gx-state-municipio','MUNICIPIO',[['','Todo Sinaloa'],...D.muniNames.map(n=>[n,n])],x.municipio)+
 field('gx-state-crop','CULTIVO',[['','Todos los cultivos'],...names.map(n=>[n,n])],x.stateCrop)+
 field('gx-state-year','AÑO',ys().map(y=>[y,y]),x.stateYear)+'</div>'+
 '<div class="gx-kpis">'+kpi('Valor agrícola',money(nom),'Cierre de '+x.stateYear)+kpi('Variación nominal',pct(change),'Respecto al año previo')+kpi('Cultivos observados',String(new Set(rows.map(r=>r.name)).size),'Con registros en el año')+kpi('Participación estatal',nom!==null&&yearTotal?pc.format(nom/yearTotal*100)+' %':'','Valor estatal del mismo año')+'</div>';
 dv.innerHTML=modes('state',[['evolucion','Evolución'],['composicion','Composición'],['informe','Conclusiones']],x.stateMode)+'<div id="gx-state-analysis"></div>';
 let host=by('gx-state-analysis');
 if(x.stateMode==='evolucion'){
  host.innerHTML=intro('Serie histórica del valor','MDP NOMINALES · 2003–2025')+'<div id="gx-state-line" class="chart"></div>';
  window.GrowaChart('gx-state-line',history,{label:'Evolución agrícola '+(x.municipio||'Sinaloa')+(x.stateCrop?' · '+x.stateCrop:'')});
 }else if(x.stateMode==='composicion'){
  const tot=sum(rows),byCrop=aggregate(rows.map(r=>({...r,Nomcultivo:r.name})),'Nomcultivo'),byMunicipio=aggregate(rows.map(r=>({...r,Nommunicipio:r.municipio})),'Nommunicipio');
  const records=x.stateYear===2025?D.records.filter(r=>(!x.municipio||r.Nommunicipio===x.municipio)&&(!x.stateCrop||r.Nomcultivo===x.stateCrop)):[];
  host.innerHTML=intro('Cultivos del año '+x.stateYear,'SELECCIONA UN CULTIVO PARA PROFUNDIZAR')+bar(byCrop,tot,'crop',15)+
  intro('Distribución municipal','VALOR DEL MISMO AÑO')+bar(byMunicipio,tot,'municipio',18)+
  (x.stateYear===2025?'<details class="gx-fold"><summary>Variedades, modalidad hídrica y ciclos de 2025 <span>+</span></summary><div class="gx-fold-body">'+[['Nomvariedad','Variedades'],['Nommodalidad','Agua'],['Nomcicloproductivo','Ciclos']].map(([key,label])=>'<h5>'+label+'</h5>'+bar(aggregate(records,key),sum(records),null,15)).join('')+'</div></details>':'<p class="gx-warning">Las variedades y tecnologías se encuentran detalladas solamente en 2025; no se atribuyen a cierres anteriores.</p>')+
  '<button data-gx-export="state" type="button" class="gx-export">Exportar filas de '+x.stateYear+' ↓</button>';
 }else{
  const r=R[x.municipio];
  host.innerHTML=r?intro('Informe municipal: '+x.municipio,'DOCUMENTO HISTÓRICO DE SINALOA')+
  [['Balance económico',r.closing1],['Origen contable de la variación',r.closing2],['Conclusión territorial',r.conclusion]].map(([title,body],i)=>'<details class="gx-fold"'+(!i?' open':'')+'><summary>'+safe(title)+' <span>+</span></summary><div class="gx-report">'+safe(body||'Texto no disponible.').replace(/\n/g,'<br>')+'</div></details>').join('')+
  '<button type="button" data-gx-old="municipios" class="gx-export">Abrir expediente completo ↗</button>':
  '<div class="gx-method"><strong>Conclusiones por municipio</strong><p>Selecciona uno de los 18 municipios para leer los tres apartados de su expediente en el informe original de 395 páginas.</p></div>';
 }
}
function cropCatalog(){return x.scope==='sinaloa'?D.cropNames:N.crops.map(r=>r[0])}
function drawCropChoices(){
 const term=by('gx-crop-search').value.toLocaleLowerCase('es'),all=cropCatalog(),names=all.filter(n=>n.toLocaleLowerCase('es').includes(term));
 by('gx-crop-count').textContent=(x.scope==='sinaloa'?'113 cultivos históricos':'10 cultivos destacados del PDF')+' · '+names.length+' coincidencias';
 by('gx-crop-list').innerHTML=names.map(n=>'<button type="button" class="gx-choice'+(x.crop===n?' active':'')+'" data-gx-crop="'+enc(n)+'"><span>'+safe(n)+'</span><small>'+(x.scope==='sinaloa'?'SERIE HISTÓRICA':'PERFIL NACIONAL')+'</small></button>').join('')||'<p class="gx-empty">No hay coincidencias.</p>';
 by('gx-crop-sinaloa').classList.toggle('active',x.scope==='sinaloa');by('gx-crop-mexico').classList.toggle('active',x.scope==='mexico');
 by('gx-crop-sinaloa').setAttribute('aria-pressed',String(x.scope==='sinaloa'));by('gx-crop-mexico').setAttribute('aria-pressed',String(x.scope==='mexico'));
}
function renderCrop(){
 if(!ready)return;drawCropChoices();
 const cv=by('gx-crop-view'),deep=by('gx-crop-deep');
 if(x.scope==='mexico'){
  const i=N.crops.findIndex(r=>r[0]===x.crop),r=N.crops[i];if(!r)return;
  const f=N.cropFacts[i];
  cv.innerHTML=header(r[0],'CULTIVO / INFORME NACIONAL','Resumen del PDF')+
  '<p class="gx-lede">'+safe(r[10])+'</p><div class="gx-kpis">'+kpi('Valor 2025',money(r[4]),'Millones nominales')+kpi('Cuota inicial',pc.format(r[1])+' %','Media 2003–2005')+kpi('Cuota reciente',pc.format(r[2])+' %','Media 2023–2025')+kpi('Cambio',(r[3]>0?'+':'')+pc.format(r[3])+' pp','Puntos porcentuales')+'</div>'+
  '<div class="gx-warning">Fuente: capítulo del informe nacional, páginas '+r[6]+'–'+(r[6]+4)+'. No se dispone aquí de una serie nacional anual ni de todos los microdatos originales.</div>';
  deep.innerHTML=intro('Entidades principales','VALOR AGRÍCOLA 2025')+bar(f.states.map(a=>({name:a[0],value:a[1]})),r[4],null,3)+
  intro('Variedades destacadas','CLASIFICACIONES DE 2025')+bar(f.varieties.map(a=>({name:a[0],value:a[1]})),r[4],null,10)+
  '<div class="gx-method"><strong>Dimensiones declaradas por el informe</strong><p>Riego: '+pc.format(f.irrigation)+' % del valor. Registros con mercado de exportación: '+pc.format(f.export)+' %. Estos indicadores no equivalen a consumo hídrico ni ventas aduaneras.</p></div>';
  return;
 }
 const all=D.crops.filter(r=>r.name===x.crop),munis=[...new Set(all.map(r=>r.municipio))].sort((a,b)=>a.localeCompare(b,'es'));
 if(x.cropMuni&&!munis.includes(x.cropMuni))x.cropMuni='';
 const history=series(r=>r.name===x.crop&&(!x.cropMuni||r.municipio===x.cropMuni));
 const now=history.find(r=>r.year===x.cropYear),prev=history.find(r=>r.year===x.cropYear-1);
 const yearRows=all.filter(r=>r.year===x.cropYear&&(!x.cropMuni||r.municipio===x.cropMuni));
 const records=D.records.filter(r=>r.Nomcultivo===x.crop&&(!x.cropMuni||r.Nommunicipio===x.cropMuni));
 const varieties=[...new Set(records.map(r=>r.Nomvariedad).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
 if(x.cropVar&&!varieties.includes(x.cropVar))x.cropVar='';
 cv.innerHTML=header(x.crop,'CULTIVO / SINALOA 2003–2025','Series históricas')+
 '<p class="gx-lede">Analiza la evolución y la distribución municipal. En el cierre de 2025 se puede filtrar por variedad, modalidad, ciclo, tecnología y destino del mercado.</p>'+
 '<div class="gx-filters">'+field('gx-crop-municipio','MUNICIPIO',[['','Todo Sinaloa'],...munis.map(n=>[n,n])],x.cropMuni)+field('gx-crop-year','AÑO',ys().map(y=>[y,y]),x.cropYear)+'</div>'+
 '<div class="gx-kpis">'+kpi('Valor agrícola',now?money(now.value):'','Cierre de '+x.cropYear)+kpi('Variación nominal',pct(now&&prev?.value>0?(now.value/prev.value-1)*100:null),'Respecto al año previo')+
 kpi('Superficie cosechada',yearRows.length?fmt.format(yearRows.reduce((t,r)=>t+(r.harvest||0),0))+' ha':'','Suma de superficies registradas')+kpi('Años observados',String(history.length),'Sin imputación de faltantes')+'</div>';
 deep.innerHTML=modes('crop',[['evolucion','Evolución histórica'],['territorio','Municipios'],['desglose','Variedades y producción 2025']],x.cropMode)+'<div id="gx-crop-analysis"></div>';
 const host=by('gx-crop-analysis');
 if(x.cropMode==='evolucion'){
  host.innerHTML=intro('Trayectoria del cultivo','VALOR HISTÓRICO · MDP NOMINALES')+'<div id="gx-crop-line" class="chart"></div>'+
  '<p class="gx-note">Los datos históricos están agregados a escala municipio-cultivo, no a escala variedad.</p>';
  window.GrowaChart('gx-crop-line',history,{label:'Trayectoria de '+x.crop+(x.cropMuni?' · '+x.cropMuni:'')});
 }else if(x.cropMode==='territorio'){
  const places=aggregate(all.filter(r=>r.year===x.cropYear).map(r=>({...r,Nommunicipio:r.municipio})),'Nommunicipio');
  host.innerHTML=intro('Distribución del valor · '+x.cropYear,'SELECCIONA MUNICIPIO PARA FILTRAR')+bar(places,sum(places),'crop-muni',18)+
  '<p class="gx-note">Los municipios sin observaciones de este cultivo en el año no figuran como producción cero.</p>';
 }else{
  const selected=records.filter(r=>!x.cropVar||r.Nomvariedad===x.cropVar);
  host.innerHTML=intro('Desglose operativo del cierre 2025','NO DISPONIBLE HISTÓRICAMENTE POR VARIEDAD')+
  '<div class="gx-filters">'+field('gx-crop-var','VARIEDAD',[['','Todas las variedades'],...varieties.map(n=>[n,n])],x.cropVar)+
  field('gx-crop-dim','AGRUPAR POR',[['Nomvariedad','Variedad'],['Nommodalidad','Modalidad de agua'],['Nomcicloproductivo','Ciclo productivo'],['TipoTecnologia','Tecnología'],['TipoProduccion','Tipo de producción'],['TipoMercado','Destino de mercado']],x.cropDim)+'</div>'+
  '<div class="gx-result-mini"><span>Valor filtrado en 2025</span><strong>'+money(sum(selected))+'</strong><span>'+selected.length+' registros originales del cierre</span></div>'+
  bar(aggregate(selected,x.cropDim),sum(selected),null,50)+
  '<button type="button" data-gx-export="crop" class="gx-export">Descargar registros 2025 filtrados ↓</button>'+
  '<p class="gx-note">El filtro de variedad únicamente modifica el desglose de 2025, no los valores de la serie histórica.</p>';
 }
}
function openState(entity,municipio){
 if(!ready)return;
 x.entity=N.states.some(r=>r[0]===entity)?entity:'Sinaloa';
 if(municipio!==undefined){x.municipio=municipio;x.stateMode='informe'}
 renderState();window.GrowaNavigate('explorar-estados');
}
function openCrop(scope,name){
 if(!ready)return;
 x.scope=scope==='mexico'?'mexico':'sinaloa';
 x.crop=cropCatalog().includes(name)?name:cropCatalog()[0];x.cropMuni='';x.cropVar='';x.cropMode='evolucion';
 renderCrop();window.GrowaNavigate('explorar-cultivos');
}
function boot(){
 if(ready||!window.GrowaSinaloaData||!window.GrowaNationalData)return;
 D=window.GrowaSinaloaData.D;R=window.GrowaSinaloaData.R;N=window.GrowaNationalData;ready=true;
 if(!D.cropNames.includes(x.crop))x.crop=D.cropNames[0];
 by('gx-state-search').addEventListener('input',drawStateChoices);
 by('gx-crop-search').addEventListener('input',drawCropChoices);
 by('gx-state-list').addEventListener('click',e=>{const b=e.target.closest('[data-gx-entity]');if(b){x.entity=dec(b.dataset.gxEntity);x.municipio='';x.stateCrop='';x.stateMode='evolucion';renderState()}});
 by('gx-crop-list').addEventListener('click',e=>{const b=e.target.closest('[data-gx-crop]');if(b){x.crop=dec(b.dataset.gxCrop);x.cropMuni='';x.cropVar='';x.cropMode='evolucion';renderCrop()}});
 by('gx-crop-sinaloa').addEventListener('click',()=>{x.scope='sinaloa';x.crop='Maíz grano';x.cropMode='evolucion';renderCrop()});
 by('gx-crop-mexico').addEventListener('click',()=>{x.scope='mexico';x.crop=N.crops[0][0];renderCrop()});
 by('gx-state-view').addEventListener('change',e=>{
  if(e.target.id==='gx-state-municipio')x.municipio=e.target.value;
  else if(e.target.id==='gx-state-crop')x.stateCrop=e.target.value;
  else if(e.target.id==='gx-state-year')x.stateYear=Number(e.target.value);
  else return;renderState()
 });
 by('gx-state-deep').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.gxMode==='state'){x.stateMode=b.dataset.gxModeValue;renderState()}
  else if(b.dataset.gxAction==='crop'){openCrop('sinaloa',dec(b.dataset.gxValue))}
  else if(b.dataset.gxAction==='municipio'){x.municipio=dec(b.dataset.gxValue);renderState()}
  else if(b.dataset.gxExport==='state'){download('growa_sinaloa_'+x.stateYear+'.csv',D.crops.filter(r=>r.year===x.stateYear&&(!x.municipio||r.municipio===x.municipio)&&(!x.stateCrop||r.name===x.stateCrop)))}
  else if(b.dataset.gxOld){by('municipio').value=x.municipio;by('municipio').dispatchEvent(new Event('change'));window.GrowaNavigate('municipios')}
 });
 by('gx-crop-view').addEventListener('change',e=>{
  if(e.target.id==='gx-crop-municipio')x.cropMuni=e.target.value;
  else if(e.target.id==='gx-crop-year')x.cropYear=Number(e.target.value);
  else return;renderCrop()
 });
 by('gx-crop-deep').addEventListener('change',e=>{
  if(e.target.id==='gx-crop-var')x.cropVar=e.target.value;
  else if(e.target.id==='gx-crop-dim')x.cropDim=e.target.value;
  else return;renderCrop()
 });
 by('gx-crop-deep').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.gxMode==='crop'){x.cropMode=b.dataset.gxModeValue;renderCrop()}
  else if(b.dataset.gxAction==='crop-muni'){x.cropMuni=dec(b.dataset.gxValue);renderCrop()}
  else if(b.dataset.gxExport==='crop'){download('growa_cultivo_2025.csv',D.records.filter(r=>r.Nomcultivo===x.crop&&(!x.cropMuni||r.Nommunicipio===x.cropMuni)&&(!x.cropVar||r.Nomvariedad===x.cropVar)))}
 });
 renderState();renderCrop();
}
window.GrowaExplorer={openState,openCrop,getContext:()=>({...x})};
window.addEventListener('growa:data-ready',boot);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


/* GROWA QUANT LAB V1
   Interactive multidimensional analysis on the Sinaloa DGSIAP panel.
   Never synthesize non-observed annual values; mixed physical units are blocked.
*/
(function(){
'use strict';
const $=id=>document.getElementById(id);
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const fmt=new Intl.NumberFormat('es-MX',{maximumFractionDigits:1,minimumFractionDigits:1});
const fmt2=new Intl.NumberFormat('es-MX',{maximumFractionDigits:2,minimumFractionDigits:2});
const f=x=>Number.isFinite(x)?fmt.format(x):'';
const p=x=>Number.isFinite(x)?fmt2.format(x):'';
const esc=escape;
const metricList={value:['Valor de producción','MDP nominales'],planted:['Superficie sembrada','hectáreas'],harvest:['Superficie cosechada','hectáreas'],loss:['Superficie siniestrada','hectáreas'],volume:['Volumen físico','unidades de origen'],yield:['Rendimiento','unidades por hectárea']};
const savesKey='growa-agro-quant-lab-v1';
const allYears=Array.from({length:23},(_,i)=>i+2003);
let D=null,ready=false,alertTimer=0,cacheRows=[];
const state={
 municipalities:new Set(),crops:new Set(),from:2003,to:2025,metric:'value',tab:'serie',
 visual:'chart',compareDimension:'municipio',compareMode:'absolute',compared:[],
 pivotRows:'municipio',pivotCols:'year',pivotMode:'raw',pivotSearch:'',
 econMode:'hhi',econYear:2025,econMuni:'',lqCrop:'',
 shapleyCrop:'',microRows:'Nommunicipio',microCols:'Nommodalidad',microFilterDim:'Nommodalidad',microFilterValue:'',microMetric:'value',microMode:'raw',loadedLink:false
};
const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const sum=(items,key)=>items.reduce((acc,r)=>acc+(Number(r[key])||0),0);
const by=(rows,field)=>{const out=new Map();for(const r of rows){const k=String(r[field]??'Sin clasificar');if(!out.has(k))out.set(k,[]);out.get(k).push(r)}return out};
const dimensions={municipio:r=>r.municipio,cultivo:r=>r.name,year:r=>String(r.year)};
const agg=(rows,metric)=>{
 if(!rows.length)return null;
 if(metric==='yield'){let a=sum(rows,'harvest'),q=sum(rows,'volume');return a>0?q/a:null}
 return sum(rows,metric);
};
const metricUnit=(metric,rows)=>{
 if(metric==='value')return 'MDP nominales';
 if(['planted','harvest','loss'].includes(metric))return 'hectáreas';
 const units=[...new Set(rows.map(r=>r.unit).filter(Boolean))];
 return units.length===1?(metric==='yield'?units[0]+'/ha':units[0]):'unidad física';
};
function safeNumber(x){return Number.isFinite(x)?f(x):'—'}
function snapshot(){
 return {municipalities:[...state.municipalities].sort(),crops:[...state.crops].sort(),from:state.from,to:state.to,metric:state.metric,tab:state.tab,visual:state.visual,compareDimension:state.compareDimension,compareMode:state.compareMode,compared:state.compared.slice(),pivotRows:state.pivotRows,pivotCols:state.pivotCols,pivotMode:state.pivotMode,econMode:state.econMode,econYear:state.econYear,econMuni:state.econMuni,lqCrop:state.lqCrop,shapleyCrop:state.shapleyCrop,microRows:state.microRows,microCols:state.microCols,microFilterDim:state.microFilterDim,microFilterValue:state.microFilterValue,microMetric:state.microMetric,microMode:state.microMode};
}
function applySnapshot(s){
 if(!s||typeof s!=='object')return;
 state.municipalities=new Set((s.municipalities||[]).filter(v=>D.muniNames.includes(v)));
 state.crops=new Set((s.crops||[]).filter(v=>D.cropNames.includes(v)));
 for(const k of ['from','to','metric','tab','visual','compareDimension','compareMode','pivotRows','pivotCols','pivotMode','econMode','econYear','econMuni','lqCrop','shapleyCrop','microRows','microCols','microFilterDim','microFilterValue','microMetric','microMode'])if(s[k]!==undefined)state[k]=s[k];
 state.compared=Array.isArray(s.compared)?s.compared.slice(0,4):[];
 state.from=Math.max(2003,Math.min(2025,Number(state.from)||2003));
 state.to=Math.max(state.from,Math.min(2025,Number(state.to)||2025));
 if(!(state.metric in metricList))state.metric='value';
 if(!['serie','comparar','matriz','estructura','shapley','micro2025'].includes(state.tab))state.tab='serie';
}
function selection(){
 return D.crops.filter(r=>r.year>=state.from&&r.year<=state.to&&(!state.municipalities.size||state.municipalities.has(r.municipio))&&(!state.crops.size||state.crops.has(r.name)));
}
function validatePhysical(rows){
 if(!['volume','yield'].includes(state.metric))return '';
 const units=[...new Set(rows.map(r=>r.unit).filter(Boolean))];
 if(units.length>1)return 'No se suman unidades físicas distintas ('+units.slice(0,4).join(', ')+(units.length>4?'…':'')+'). Selecciona un solo cultivo o cultivos con la misma unidad para estudiar volumen o rendimiento.';
 if(!units.length)return 'No hay unidades físicas informadas para esta selección.';
 return '';
}
function chartData(rows,metric){
 const map=by(rows,'year');return allYears.filter(y=>y>=state.from&&y<=state.to&&map.has(String(y))).map(y=>({year:y,value:agg(map.get(String(y)),metric)})).filter(x=>Number.isFinite(x.value));
}
function notify(t){
 const el=$('lab-toast');if(!el)return;
 el.textContent=t;el.hidden=false;clearTimeout(alertTimer);
 alertTimer=setTimeout(()=>el.hidden=true,3300);
}
function htmlOptions(values,current){return values.map(([v,label])=>'<option value="'+esc(v)+'"'+(String(v)===String(current)?' selected':'')+'>'+esc(label)+'</option>').join('')}
function selector(id,label,values,current){return '<label class="lab-choice-field">'+esc(label)+'<select id="'+id+'">'+htmlOptions(values,current)+'</select></label>'}
const yearOptions=()=>allYears.map(y=>[y,String(y)]);
function addRowChecks(kind){
 const input=$(kind==='municipalities'?'lab-muni-search':'lab-crop-search');
 const names=(kind==='municipalities'?D.muniNames:D.cropNames).filter(n=>normalize(n).includes(normalize(input?.value||'')));
 const selected=state[kind];
 const holder=$(kind==='municipalities'?'lab-muni-options':'lab-crop-options');
 const countId=kind==='municipalities'?'lab-muni-foot':'lab-crop-foot';
 holder.innerHTML=names.map(name=>'<label class="lab-check"><input type="checkbox" data-lab-facet="'+(kind==='municipalities'?'muni':'crop')+'" value="'+esc(name)+'"'+(selected.has(name)?' checked':'')+'><span>'+esc(name)+'</span></label>').join('')||'<p class="lab-no-results">Sin coincidencias</p>';
 $(countId).textContent=selected.size?selected.size+' seleccionados de '+(kind==='municipalities'?D.muniNames.length:D.cropNames.length):'Todos los '+(kind==='municipalities'?'municipios':'cultivos')+' ('+(kind==='municipalities'?D.muniNames.length:D.cropNames.length)+')';
}
function syncSidebar(){
 addRowChecks('municipalities');addRowChecks('crops');
 $('lab-year-from').value=String(state.from);$('lab-year-to').value=String(state.to);$('lab-metric').value=state.metric;
 const m=state.municipalities.size?state.municipalities.size+' municipios':'18 municipios';
 const c=state.crops.size?state.crops.size+' cultivos':'todos los cultivos';
 $('lab-query-title').textContent=m+' · '+c+' · '+state.from+'–'+state.to;
 const caveat=state.metric==='value'?'Pesos corrientes sin deflactar.':state.metric==='volume'||state.metric==='yield'?'Solo unidades físicas homogéneas.':'Suma de hectáreas por cultivo y ciclo registrado.';
 $('lab-metric-caveat').textContent=caveat;
}
function lineSVG(series,range,label,unit){
 const W=890,H=298,L=76,R=22,T=25,B=46,iw=W-L-R,ih=H-T-B;
 const values=series.flatMap(s=>s.points.map(p=>p.value)).filter(Number.isFinite);
 if(!values.length)return '<div class="lab-empty">No hay observaciones para graficar.</div>';
 const ymax=Math.max(1,...values)*1.08;
 const x=y=>L+(y-range[0])/Math.max(1,range[1]-range[0])*iw;
 const y=v=>T+ih-(v/ymax)*ih;
 const ticks=[0,.25,.5,.75,1].map(t=>'<line x1="'+L+'" y1="'+(T+ih*(1-t))+'" x2="'+(W-R)+'" y2="'+(T+ih*(1-t))+'" stroke="#e6e6e6"/><text x="'+(L-12)+'" y="'+(T+ih*(1-t)+4)+'" text-anchor="end" fill="#777" font-size="11">'+esc(f(ymax*t))+'</text>').join('');
 const markYears=[...new Set([range[0],Math.round(range[0]+(range[1]-range[0])/4),Math.round((range[0]+range[1])/2),Math.round(range[0]+3*(range[1]-range[0])/4),range[1]])];
 const marks=markYears.map(year=>'<text x="'+x(year)+'" y="'+(H-15)+'" text-anchor="middle" fill="#888" font-size="11">'+year+'</text>').join('');
 const shades=['#101010','#545454','#999999','#bebebe'];
 const pathLines=series.map((line,i)=>{
  const c=shades[i%shades.length],dash=['','8 4','3 4','12 5 2 5'][i%4],data=line.points.slice().sort((a,b)=>a.year-b.year);
  const segments=[];let curr=[];
  data.forEach(v=>{if(curr.length&&v.year-curr.at(-1).year>1){segments.push(curr);curr=[]}curr.push(v)});
  if(curr.length)segments.push(curr);
  const paths=segments.map(seg=>'<path d="'+seg.map((p,j)=>(j?'L':'M')+x(p.year).toFixed(1)+' '+y(p.value).toFixed(1)).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="2.6" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>').join('');
  const dots=data.map(point=>'<circle cx="'+x(point.year).toFixed(1)+'" cy="'+y(point.value).toFixed(1)+'" r="3.5" fill="'+c+'" stroke="#fff" stroke-width="1.2" tabindex="0" role="img" aria-label="'+esc(line.name+' '+point.year+': '+f(point.value)+' '+unit)+'"><title>'+esc(line.name+' · '+point.year+' · '+f(point.value)+' '+unit)+'</title></circle>').join('');
  return paths+dots;
 }).join('');
 return '<div class="lab-figure"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(label)+'">'+ticks+marks+pathLines+'</svg></div>';
}
function metricFigure(rows){
 const history=chartData(rows,state.metric);
 const series=[{name:'Selección',points:history}];
 const table='<div class="lab-table-scroll"><table class="lab-table"><thead><tr><th>Año</th><th class="lab-num">'+esc(metricList[state.metric][0])+'</th></tr></thead><tbody>'+history.map(r=>'<tr><td>'+r.year+'</td><td class="lab-num">'+f(r.value)+'</td></tr>').join('')+'</tbody></table></div>';
 return '<div class="lab-subtoolbar"><div><span class="lab-eyebrow">01 / SERIE TEMPORAL</span><h3>Cómo evoluciona la selección</h3></div><div class="lab-segment" role="group" aria-label="Visualización"><button data-lab-visual="chart" class="'+(state.visual==='chart'?'active':'')+'">Gráfica</button><button data-lab-visual="table" class="'+(state.visual==='table'?'active':'')+'">Tabla</button></div></div>'+
 (state.visual==='chart'?lineSVG(series,[state.from,state.to],'Evolución del indicador seleccionado',metricUnit(state.metric,rows)):table)+
 '<div class="lab-figure-note">'+history.length+' cierres con observaciones · '+esc(metricUnit(state.metric,rows))+' · Los años no registrados se omiten, nunca se reemplazan con ceros.</div>'+
 '<div class="lab-quick-export"><button data-lab-export="series">Descargar serie filtrada CSV ↓</button></div>';
}
function comparisonValues(rows,dimension){
 const fn=dimensions[dimension],items=new Map();
 rows.forEach(r=>{const key=fn(r);if(!items.has(key))items.set(key,[]);items.get(key).push(r)});
 return [...items].map(([name,list])=>({name,rows:list,total:agg(list,state.metric)||0})).sort((a,b)=>b.total-a.total);
}
function renderComparison(rows){
 const groups=comparisonValues(rows,state.compareDimension);
 let checked=state.compared.filter(n=>groups.some(v=>v.name===n));
 if(!checked.length){checked=groups.slice(0,Math.min(4,groups.length)).map(v=>v.name)}
 const options=groups.slice(0,40);
 const controls='<div class="lab-subtoolbar"><div><span class="lab-eyebrow">02 / COMPARACIÓN</span><h3>Series en paralelo</h3><p>Hasta cuatro municipios o cultivos sobre una misma escala.</p></div><div class="lab-inline-controls">'+
 selector('lab-cmp-group','Comparar por',[['municipio','Municipio'],['cultivo','Cultivo']],state.compareDimension)+
 selector('lab-cmp-normalize','Escala',[['absolute','Valor absoluto'],['index','Índice base 100']],state.compareMode)+'</div></div>'+
 '<div class="lab-compare-choices" role="group" aria-label="Series en comparación">'+options.map(r=>'<label class="lab-compare-chip"><input type="checkbox" data-lab-comp="'+esc(r.name)+'"'+(checked.includes(r.name)?' checked':'')+'><span>'+esc(r.name)+'</span></label>').join('')+'</div>';
 const lines=checked.slice(0,4).map(name=>{
  let sequence=chartData(groups.find(r=>r.name===name)?.rows||[],state.metric);
  if(state.compareMode==='index'){
   const base=sequence.find(r=>r.value>0)?.value;
   sequence=base?sequence.map(r=>({year:r.year,value:r.value/base*100})):[];
  }
  return {name,points:sequence}
 });
 const legends=lines.map((r,i)=>'<div class="lab-legend-item"><span class="lab-line lab-line-'+i+'"></span><span>'+esc(r.name)+'</span></div>').join('');
 const note=state.compareMode==='index'?'Cada serie toma como base 100 su primera observación positiva dentro del periodo; las bases pueden corresponder a años diferentes.':'Comparación en '+metricUnit(state.metric,rows)+'; la ausencia de observaciones no equivale a cero.';
 return controls+legends+lineSVG(lines,[state.from,state.to],'Comparación de series',state.compareMode==='index'?'índice base 100':metricUnit(state.metric,rows))+
 '<p class="lab-figure-note">'+esc(note)+'</p>';
}
function pivotData(rows){
 const rDim=state.pivotRows,cDim=state.pivotCols;
 const rowMap=new Map(),colMap=new Map(),cells=new Map();
 for(const record of rows){
  const rk=dimensions[rDim](record),ck=dimensions[cDim](record),key=rk+'\u0000'+ck;
  if(!rowMap.has(rk))rowMap.set(rk,[]);rowMap.get(rk).push(record);
  if(!colMap.has(ck))colMap.set(ck,[]);colMap.get(ck).push(record);
  if(!cells.has(key))cells.set(key,[]);cells.get(key).push(record);
 }
 const sortEntries=(arr,dim)=>arr.sort((a,b)=>dim==='year'?Number(a[0])-Number(b[0]):(agg(b[1],state.metric)||0)-(agg(a[1],state.metric)||0));
 const rKeys=sortEntries([...rowMap],rDim).map(v=>v[0]),cKeys=sortEntries([...colMap],cDim).map(v=>v[0]);
 const total=agg(rows,state.metric);
 const value=(rk,ck)=>agg(cells.get(rk+'\u0000'+ck)||[],state.metric);
 const shown=(v,rk,ck)=>{
  if(v===null)return null;
  const denom=state.pivotMode==='shareRow'?agg(rowMap.get(rk)||[],state.metric):state.pivotMode==='shareCol'?agg(colMap.get(ck)||[],state.metric):null;
  return denom===null?v:denom>0?v/denom*100:null;
 };
 return {rKeys,cKeys,rowMap,colMap,total,value,shown};
}
function pivotExport(pivot){
 const out=[];for(const rk of pivot.rKeys){
  const row={[state.pivotRows]:rk};
  for(const ck of pivot.cKeys)row[ck]=pivot.shown(pivot.value(rk,ck),rk,ck);
  row.total=agg(pivot.rowMap.get(rk),state.metric);
  out.push(row);
 }return out;
}
function renderPivot(rows){
 if(state.metric==='yield'&&state.pivotMode!=='raw')state.pivotMode='raw';
 const pv=pivotData(rows);
 const filter=normalize(state.pivotSearch);
 const displayRows=pv.rKeys.filter(k=>normalize(k).includes(filter));
 const shownRows=displayRows.slice(0,35),shownCols=pv.cKeys.slice(0,25);
 const table='<div class="lab-table-scroll lab-pivot-scroll"><table class="lab-table lab-pivot"><thead><tr><th>'+esc({municipio:'Municipio',cultivo:'Cultivo',year:'Año'}[state.pivotRows])+'</th>'+shownCols.map(c=>'<th class="lab-num">'+esc(c)+'</th>').join('')+'<th class="lab-num">Total</th></tr></thead>'+
 '<tbody>'+shownRows.map(k=>'<tr><th>'+esc(k)+'</th>'+shownCols.map(c=>{const v=pv.shown(pv.value(k,c),k,c);return '<td class="lab-num">'+(v===null?'':f(v)+(state.pivotMode!=='raw'?' %':''))+'</td>'}).join('')+'<td class="lab-num lab-strong">'+safeNumber(agg(pv.rowMap.get(k),state.metric))+'</td></tr>').join('')+'</tbody></table></div>';
 const options=[['municipio','Municipio'],['cultivo','Cultivo'],['year','Año']];
 const controls='<div class="lab-subtoolbar"><div><span class="lab-eyebrow">03 / TABLA DINÁMICA</span><h3>Cruza dimensiones</h3><p>Reorganiza las variables, compara periodos y exporta todos los resultados.</p></div></div><div class="lab-pivot-options">'+
 selector('lab-pivot-rows','Filas',options,state.pivotRows)+selector('lab-pivot-cols','Columnas',options,state.pivotCols)+
 selector('lab-pivot-mode','Presentación',[['raw','Valor / indicador'],['shareRow','% de fila'],['shareCol','% de columna']],state.pivotMode)+
 '<label class="lab-choice-field">Buscar fila<input id="lab-pivot-search" type="search" value="'+esc(state.pivotSearch)+'" placeholder="Filtrar filas..."></label></div>';
 return controls+'<div class="lab-pivot-count">'+displayRows.length+' filas · '+pv.cKeys.length+' columnas. Vista previa: '+shownRows.length+' filas y '+shownCols.length+' columnas.</div>'+table+
 '<p class="lab-figure-note">Los guiones indican celdas sin observaciones. Las participaciones se calculan sobre el universo filtrado; los totales de rendimiento son promedios ponderados, no sumas.</p>'+
 '<div class="lab-quick-export"><button data-lab-export="pivot">Exportar matriz completa CSV ↓</button></div>';
}
function concentration(data,year){
 const rows=data.filter(r=>r.year===year),grouped=by(rows,'municipio');
 return [...grouped].map(([name,recs])=>{
  const crops=by(recs,'name'),arr=[...crops].map(([crop,part])=>({crop,value:sum(part,'value')})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
  const total=arr.reduce((n,r)=>n+r.value,0);
  if(total<=0)return null;
  const hhi=arr.reduce((n,r)=>n+(r.value/total)**2,0);
  return {name,total,hhi,effective:1/hhi,n:arr.length,leader:arr[0]?.crop||'',topShare:arr[0]?.value/total*100};
 }).filter(Boolean).sort((a,b)=>b.hhi-a.hhi);
}
function renderEconomy(rows){
 const latest=state.econYear;
 const hhi=concentration(rows,latest);
 const controls='<div class="lab-subtoolbar"><div><span class="lab-eyebrow">04 / ESTRUCTURA PRODUCTIVA</span><h3>Concentración y especialización</h3><p>Indicadores económicos derivados de las participaciones de valor nominal.</p></div></div>'+
 '<div class="lab-pivot-options">'+selector('lab-econ-mode','Indicador',[['hhi','Concentración (HHI)'],['lq','Especialización (LQ)']],state.econMode)+
 selector('lab-econ-year','Año',allYears.filter(y=>y>=state.from&&y<=state.to).reverse().map(y=>[y,y]),latest)+'</div>';
 if(state.econMode==='lq'){
  const yearAll=D.crops.filter(r=>r.year===latest),allBy=by(yearAll,'name'),stateTotal=sum(yearAll,'value'),cropNames=[...allBy.keys()].sort((a,b)=>a.localeCompare(b,'es'));
  const crop=cropNames.includes(state.lqCrop)?state.lqCrop:(cropNames[0]||'');
  const shareState=stateTotal?sum(allBy.get(crop)||[],'value')/stateTotal:0;
  const groupMuni=by(yearAll,'municipio');
  const results=[...groupMuni].filter(([name])=>!state.municipalities.size||state.municipalities.has(name)).map(([name,mr])=>{
    const denom=sum(mr,'value'),q=sum(mr.filter(r=>r.name===crop),'value');
    const lq=denom>0&&shareState>0?(q/denom)/shareState:null;
    return {name,denom,cropValue:q,lq};
  }).filter(r=>r.lq!==null).sort((a,b)=>b.lq-a.lq);
  return controls+selector('lab-lq-crop','Cultivo de referencia',cropNames.map(n=>[n,n]),crop)+
   '<div class="lab-statline"><strong>Índice de especialización relativa</strong><span>LQ = (cuota cultivo / municipio) ÷ (cuota cultivo / Sinaloa)</span></div>'+
   '<div class="lab-table-scroll"><table class="lab-table"><thead><tr><th>Municipio</th><th class="lab-num">LQ</th><th class="lab-num">Valor del cultivo · MDP</th></tr></thead><tbody>'+
   results.map(r=>'<tr><td>'+esc(r.name)+'</td><td class="lab-num lab-strong">'+p(r.lq)+'</td><td class="lab-num">'+f(r.cropValue)+'</td></tr>').join('')+'</tbody></table></div>'+
   '<p class="lab-figure-note">LQ superior a 1 significa mayor especialización relativa. El denominador utiliza todos los cultivos de Sinaloa en el mismo año, sin restringirse a los cultivos filtrados de la consulta.</p>';
 }
 const selected=state.econMuni&&hhi.some(x=>x.name===state.econMuni)?state.econMuni:(hhi[0]?.name||'');
 // Chronological series calculated independently, preserving each actual year.
 const evolution=allYears.filter(y=>y>=state.from&&y<=state.to).flatMap(y=>{const item=concentration(rows,y).find(r=>r.name===selected);return item?[{year:y,value:item.hhi}]:[]});
 const table='<div class="lab-table-scroll"><table class="lab-table"><thead><tr><th>Municipio</th><th class="lab-num">HHI</th><th class="lab-num">Cultivos efectivos</th><th>Mayor cultivo</th><th class="lab-num">Cuota líder</th></tr></thead><tbody>'+
 hhi.map(r=>'<tr><td>'+esc(r.name)+'</td><td class="lab-num lab-strong">'+p(r.hhi)+'</td><td class="lab-num">'+p(r.effective)+'</td><td>'+esc(r.leader)+'</td><td class="lab-num">'+p(r.topShare)+' %</td></tr>').join('')+'</tbody></table></div>';
 return controls+selector('lab-econ-muni','Evolución de municipio',hhi.map(r=>[r.name,r.name]),selected)+
 '<div class="lab-statline"><strong>HHI = Σ(participación de cada cultivo)²</strong><span>0–1; mayor valor significa mayor concentración</span></div>'+
 (evolution.length?lineSVG([{name:selected,points:evolution}],[state.from,state.to],'Concentración HHI a lo largo del periodo','índice HHI'):'<div class="lab-empty">No hay observaciones suficientes.</div>')+
 '<div class="lab-section-caption">Distribución territorial del HHI · '+latest+'</div>'+table+
 '<p class="lab-figure-note">El HHI y su inverso (cultivos efectivos) usan el valor agrícola observado en los cultivos seleccionados; no son indicadores de rentabilidad. Con un solo cultivo el HHI es 1 por construcción.</p>';
}
function shapleyContributions(a,b){
 const keys=['area','yield','price'],factor=(r)=>r.area*r.yield*r.price;
 const output={area:0,yield:0,price:0};
 for(const order of [['area','yield','price'],['area','price','yield'],['yield','area','price'],['yield','price','area'],['price','area','yield'],['price','yield','area']]){
  let current={...a};
  for(const k of order){const before=factor(current);current[k]=b[k];output[k]+=(factor(current)-before)/6}
 }
 return output;
}
function renderShapley(rows){
 const years=[state.from,state.to];
 const cNames=[...new Set(rows.map(r=>r.name))].sort((a,b)=>a.localeCompare(b,'es'));
 const chosen=cNames.includes(state.shapleyCrop)?state.shapleyCrop:(cNames.includes('Maíz grano')?'Maíz grano':cNames[0]);
 const filter=rows.filter(r=>r.name===chosen),a=filter.filter(r=>r.year===state.from),b=filter.filter(r=>r.year===state.to);
 const head='<div class="lab-subtoolbar"><div><span class="lab-eyebrow">05 / DESCOMPOSICIÓN ECONÓMICA</span><h3>¿Qué explica contablemente el cambio de valor?</h3><p>Descomposición Shapley exacta: superficie × rendimiento × precio implícito.</p></div></div>'+
 selector('lab-dec-crop','Cultivo (una misma unidad física)',cNames.map(n=>[n,n]),chosen)+
 '<div class="lab-equation">Valor = Superficie cosechada × Rendimiento físico × Precio implícito</div>';
 if(state.from===state.to)return head+'<div class="lab-warning">Selecciona dos años diferentes en el panel de filtros para calcular el cambio de valor.</div>';
 const units=[...new Set([...a,...b].map(r=>r.unit).filter(Boolean))];
 if(!a.length||!b.length||units.length!==1||[...a,...b].some(r=>!r.unit))return head+'<div class="lab-warning">No es posible descomponer esta selección. Se requieren observaciones en ambos años y una sola unidad física compatible. Prueba otro cultivo, municipio o periodo.</div>';
 function calculate(recs){const area=sum(recs,'harvest'),quantity=sum(recs,'volume'),val=sum(recs,'value');return {area,yield:area>0?quantity/area:0,price:quantity>0?val/quantity:0,value:val,quantity};}
 const first=calculate(a),last=calculate(b);
 if([first.area,first.yield,first.price,last.area,last.yield,last.price].some(v=>v<=0))return head+'<div class="lab-warning">No existen suficientes valores positivos de superficie, volumen o producción para una descomposición multiplicativa válida.</div>';
 const effects=shapleyContributions(first,last),difference=last.value-first.value,calcSum=Object.values(effects).reduce((n,v)=>n+v,0);
 const denom=Math.max(1,...Object.values(effects).map(Math.abs));
 const labels=[['area','Superficie cosechada'],['yield','Rendimiento físico'],['price','Precio implícito']];
 return head+'<div class="lab-shapley-years">'+[["AÑO INICIAL",state.from,first],["AÑO FINAL",state.to,last]].map(([label,year,r])=>'<div><span>'+label+' · '+year+'</span><strong>'+f(r.value)+' MDP</strong><small>'+f(r.area)+' ha · '+f(r.quantity)+' '+esc(units[0])+'</small></div>').join('')+'</div>'+
 '<div class="lab-shapley-result"><span>CAMBIO CONTABLE TOTAL</span><strong>'+(difference>0?'+':'')+f(difference)+' MDP</strong><small>Residuo por precisión numérica: '+f(difference-calcSum)+' MDP</small></div>'+
 '<div class="lab-contributions">'+labels.map(([key,label])=>{const v=effects[key];return '<div class="lab-contrib"><div><strong>'+label+'</strong><span>'+(v>0?'+':'')+f(v)+' MDP</span></div><div class="lab-contrib-track"><span class="'+(v<0?'negative':'')+'" style="width:'+((Math.abs(v)/denom)*100).toFixed(2)+'%"></span></div></div>'}).join('')+'</div>'+
 '<div class="lab-method"><strong>Interpretación rigurosa</strong><p>Los efectos se asignan promediando los seis órdenes de sustitución posibles de tres factores. La suma coincide con la diferencia entre valores nominales de los años elegidos (salvo redondeo). Son contribuciones algebraicas, no estimaciones causales. El precio es V/Q, no necesariamente un precio contractual; no se deflactó. La unidad '+esc(units[0])+' debe conservar significado homogéneo.</p></div>';
}
const MICRO_DIMS=[
 ['Nommunicipio','Municipio'],['Nomcultivo','Cultivo'],['Nomvariedad','Variedad'],['Nommodalidad','Modalidad de agua'],
 ['Nomcicloproductivo','Ciclo productivo'],['TipoTecnologia','Tecnología'],['TipoProduccion','Producción'],['TipoMercado','Mercado']
];
function microBase(){
 return D.records.filter(r=>(!state.municipalities.size||state.municipalities.has(r.Nommunicipio))&&(!state.crops.size||state.crops.has(r.Nomcultivo)));
}
function microRecords(){
 const base=microBase(),key=state.microFilterDim,v=state.microFilterValue;
 return base.filter(r=>!v||String(r[key]??'Sin clasificar')===v);
}
function microMatrix(){
 const rows=microRecords().map(r=>({...r,unit:r.Nomunidad}));
 const rdim=state.microRows,cdim=state.microCols;
 const rowMap=new Map(),colMap=new Map(),cellMap=new Map();
 for(const row of rows){
  const rk=String(row[rdim]||'Sin clasificar'),ck=String(row[cdim]||'Sin clasificar'),key=rk+'\u0000'+ck;
  if(!rowMap.has(rk))rowMap.set(rk,[]);rowMap.get(rk).push(row);
  if(!colMap.has(ck))colMap.set(ck,[]);colMap.get(ck).push(row);
  if(!cellMap.has(key))cellMap.set(key,[]);cellMap.get(key).push(row);
 }
 const metric=state.microMetric,tot=r=>agg(r,metric);
 const rkeys=[...rowMap.keys()].sort((a,b)=>(tot(rowMap.get(b))||0)-(tot(rowMap.get(a))||0));
 const ckeys=[...colMap.keys()].sort((a,b)=>(tot(colMap.get(b))||0)-(tot(colMap.get(a))||0));
 const get=(rk,ck)=>tot(cellMap.get(rk+'\u0000'+ck)||[]);
 const display=(rk,ck)=>{
  const val=get(rk,ck);if(val===null)return null;
  if(state.microMode==='raw')return val;
  const den=state.microMode==='shareRow'?tot(rowMap.get(rk)):tot(colMap.get(ck));
  return den>0?val/den*100:null;
 };
 const exportRows=rkeys.map(rk=>{
  const row={[rdim]:rk};
  ckeys.forEach(ck=>{row[ck]=display(rk,ck)});
  row.total=tot(rowMap.get(rk));return row;
 });
 return {rows,rowMap,colMap,rkeys,ckeys,get,display,exportRows,total:tot(rows)};
}
function renderMicro(){
 const base=microBase(),dimensions=MICRO_DIMS,keys=dimensions.map(x=>x[0]);
 if(!keys.includes(state.microRows))state.microRows='Nommunicipio';
 if(!keys.includes(state.microCols)||state.microCols===state.microRows)state.microCols=state.microRows==='Nommodalidad'?'Nommunicipio':'Nommodalidad';
 if(!keys.includes(state.microFilterDim))state.microFilterDim='Nommodalidad';
 if(state.microMetric==='yield'&&state.microMode!=='raw')state.microMode='raw';
 const categories=[...new Set(base.map(r=>String(r[state.microFilterDim]||'Sin clasificar')))].sort((a,b)=>a.localeCompare(b,'es'));
 if(state.microFilterValue&&!categories.includes(state.microFilterValue))state.microFilterValue='';
 const options=dimensions.map(r=>r.slice());
 const controls='<div class="lab-subtoolbar"><div><span class="lab-eyebrow">06 / CIERRE DETALLADO</span><h3>Variedades, ciclos y tecnología</h3><p>Tabla cruzada de los 637 registros originales del cierre 2025, condicionada por municipios y cultivos seleccionados.</p></div></div>'+
 '<div class="lab-micro-notice"><strong>Base 2025 exclusivamente.</strong> Los filtros de periodo histórico no se aplican aquí. Esta sección analiza las observaciones detalladas registradas para 2025; no reconstruye variedades, tecnología o mercado de años anteriores.</div>'+
 '<div class="lab-pivot-options">'+
 selector('lab-micro-rows','Filas',options,state.microRows)+
 selector('lab-micro-cols','Columnas',options,state.microCols)+
 selector('lab-micro-filter-dim','Filtrar atributo',options,state.microFilterDim)+
 selector('lab-micro-filter-value','Categoría',[['','Todas las categorías'],...categories.map(x=>[x,x])],state.microFilterValue)+
 selector('lab-micro-metric','Indicador',[['value','Valor bruto · MDP'],['harvest','Cosechada · ha'],['planted','Sembrada · ha'],['volume','Volumen físico'],['yield','Rendimiento ponderado']],state.microMetric)+
 selector('lab-micro-mode','Presentación',[['raw','Cifra absoluta'],['shareRow','% dentro de fila'],['shareCol','% dentro de columna']],state.microMode)+
 '</div>';
 const filtered=microRecords();
 const physical=['volume','yield'].includes(state.microMetric);
 const units=[...new Set(filtered.map(r=>r.Nomunidad).filter(Boolean))];
 if(physical&&units.length!==1)return controls+'<div class="lab-warning">Las filas contienen '+units.length+' unidades físicas diferentes. Selecciona un solo cultivo o variedades compatibles, o utiliza valor monetario o hectáreas para comparar esta tabla.</div>';
 const matrix=microMatrix(),tr=matrix.rkeys.slice(0,35),tc=matrix.ckeys.slice(0,24);
 const table='<div class="lab-table-scroll lab-pivot-scroll"><table class="lab-table lab-pivot"><thead><tr><th>'+esc(dimensions.find(x=>x[0]===state.microRows)[1])+'</th>'+
 tc.map(c=>'<th class="lab-num">'+esc(c)+'</th>').join('')+'<th class="lab-num">Total</th></tr></thead><tbody>'+
 tr.map(rk=>'<tr><th>'+esc(rk)+'</th>'+tc.map(ck=>{const v=matrix.display(rk,ck);return '<td class="lab-num">'+(v===null?'':f(v)+(state.microMode==='raw'?'':' %'))+'</td>'}).join('')+
 '<td class="lab-num lab-strong">'+safeNumber(agg(matrix.rowMap.get(rk),state.microMetric))+'</td></tr>').join('')+'</tbody></table></div>';
 const stats='<div class="lab-micro-summary"><div><span>REGISTROS SELECCIONADOS</span><strong>'+filtered.length+'</strong></div><div><span>VALOR NOMINAL SELECCIONADO</span><strong>'+f(sum(filtered,'value'))+' MDP</strong></div><div><span>FILAS × COLUMNAS</span><strong>'+matrix.rkeys.length+' × '+matrix.ckeys.length+'</strong></div></div>';
 return controls+stats+'<div class="lab-pivot-count">Vista previa: '+tr.length+' de '+matrix.rkeys.length+' filas · '+tc.length+' de '+matrix.ckeys.length+' columnas. CSV incluye todas las filas.</div>'+table+
 '<p class="lab-figure-note">Los guiones indican cruces sin observaciones, no producción cero. El rendimiento se calcula como volumen total dividido por superficie cosechada (solo unidad homogénea). Las categorías «sin clasificar» se conservan como tales.</p>'+
 '<div class="lab-quick-export"><button data-lab-export="micro-matrix">Exportar matriz CSV ↓</button><button data-lab-export="micro-rows">Descargar registros filtrados de 2025 ↓</button></div>';
}
function updateSummary(rows,error){
 const years=new Set(rows.map(r=>r.year)),munis=new Set(rows.map(r=>r.municipio)),crops=new Set(rows.map(r=>r.name));
 const summaryMetric=['estructura','shapley','micro2025'].includes(state.tab)?'value':state.metric;
 const series=chartData(rows,summaryMetric),latest=series.at(-1),first=series[0];
 const v=latest?latest.value:null;
 const change=first&&latest&&first.value>0&&(first.year!==latest.year)?(v/first.value-1)*100:null;
 $('lab-query-count').textContent=rows.length.toLocaleString('es-MX')+' filas históricas';
 $('lab-summary').innerHTML=[
  ['AÑOS CON REGISTRO',String(years.size),'Entre '+state.from+' y '+state.to],
  ['MUNICIPIOS',String(munis.size),'Territorios presentes'],
  ['CULTIVOS',String(crops.size),'Catálogo observado'],
  ...(latest&&v!==null?[['ÚLTIMO AÑO OBSERVADO',String(latest.year),f(v)+' '+metricUnit(summaryMetric,rows)]]:[]),
  ...(change!==null?[['CAMBIO DEL PERIODO',(change>0?'+':'')+p(change)+' %','Primera vs. última observación']]:[]),
 ].map(([label,note,sub])=>'<div class="lab-summary-cell"><span>'+label+'</span><strong>'+esc(note)+'</strong><small>'+esc(sub)+'</small></div>').join('');
 const warn=$('lab-error');warn.hidden=!error;warn.textContent=error;
}
function render(){
 if(!ready)return;
 syncSidebar();
 const rows=selection();cacheRows=rows;
 if($('lab-report-sheet'))$('lab-report-sheet').hidden=true;
 const error=['estructura','shapley','micro2025'].includes(state.tab)?'':validatePhysical(rows);
 const summaryRows=state.tab==='micro2025'?D.crops.filter(r=>r.year===2025&&(!state.municipalities.size||state.municipalities.has(r.municipio))&&(!state.crops.size||state.crops.has(r.name))):rows;
 updateSummary(summaryRows,error);
 if(state.tab==='micro2025')$('lab-query-count').textContent=microBase().length.toLocaleString('es-MX')+' registros detallados · 2025';
 document.querySelectorAll('[data-lab-tab]').forEach(b=>{const on=b.dataset.labTab===state.tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});
 const host=$('lab-content');
 if(state.tab==='micro2025'){host.innerHTML=renderMicro();return}
 if(error){host.innerHTML='<div class="lab-empty">Corrige la selección de unidades para continuar con el análisis.</div>';return}
 if(!rows.length){host.innerHTML='<div class="lab-empty">No hay observaciones para esta combinación. Amplía el periodo o elimina algún filtro.</div>';return}
 if(state.tab==='serie')host.innerHTML=metricFigure(rows);
 if(state.tab==='comparar')host.innerHTML=renderComparison(rows);
 if(state.tab==='matriz')host.innerHTML=renderPivot(rows);
 if(state.tab==='estructura')host.innerHTML=renderEconomy(rows);
 if(state.tab==='shapley')host.innerHTML=renderShapley(rows);
}
function downloadCurrent(){
 if(state.tab==='micro2025'){
  const records=microRecords();
  if(records.length)window.GrowaDownloadCSV('growa_detalle_agricola_2025.csv',records);
  else notify('No existen observaciones del cierre 2025 con estos filtros.');
  return;
 }
 const rows=cacheRows.map(r=>({anio:r.year,municipio:r.municipio,cultivo:r.name,unidad:r.unit,valor_mdp:r.value,sembrada_ha:r.planted,cosechada_ha:r.harvest,siniestrada_ha:r.loss,volumen:r.volume,fuente:'DGSIAP Sinaloa'}));
 if(!rows.length){notify('No hay filas disponibles para exportar.');return}
 window.GrowaDownloadCSV('growa_laboratorio_dgsiap_'+state.from+'_'+state.to+'.csv',rows);
}
function downloads(kind){
 const rows=selection();
 if(kind==='series')return window.GrowaDownloadCSV('growa_serie_filtrada.csv',chartData(rows,state.metric).map(r=>({anio:r.year,indicador:state.metric,valor:r.value,unidad:metricUnit(state.metric,rows),fuente:'DGSIAP Sinaloa'})));
 if(kind==='pivot')return window.GrowaDownloadCSV('growa_tabla_dinamica.csv',pivotExport(pivotData(rows)));
 if(kind==='micro-rows')return window.GrowaDownloadCSV('growa_detalle_2025.csv',microRecords());
 if(kind==='micro-matrix')return window.GrowaDownloadCSV('growa_matriz_2025.csv',microMatrix().exportRows);
}
function stored(){try{const arr=JSON.parse(localStorage.getItem(savesKey)||'[]');return Array.isArray(arr)?arr:[]}catch(e){return []}}
function saveList(items){try{localStorage.setItem(savesKey,JSON.stringify(items.slice(0,20)));return true}catch(e){notify('No se pudo guardar la vista en este navegador.');return false}}
function showSaves(){
 const items=stored();
 $('lab-saved').innerHTML=items.length?items.map((r,i)=>'<div class="lab-saved-card"><button type="button" data-lab-load="'+i+'"><span>'+esc(r.label)+'</span><small>'+esc(r.date||'')+'</small></button><button type="button" data-lab-delete="'+i+'" aria-label="Eliminar vista guardada">×</button></div>').join(''):'<p class="lab-saved-empty">Todavía no hay consultas guardadas. Usa «Guardar vista» para recuperar una combinación de filtros y análisis.</p>';
}

/* Institutional briefing: descriptive, source-grounded, never causal. */
function renderInstitutionalReport(){
 const microMode=state.tab==='micro2025';
 const rows=microMode?D.crops.filter(r=>r.year===2025&&(!state.municipalities.size||state.municipalities.has(r.municipio))&&(!state.crops.size||state.crops.has(r.name))):selection();
 const has=rows.length>0,firstYear=microMode?2025:state.from,lastYear=microMode?2025:state.to;
 const sourceUnit=metricUnit(state.metric,rows);
 const totalValueByYear=chartData(rows,'value');
 const first=totalValueByYear[0],last=totalValueByYear.at(-1);
 const difference=first&&last&&last.year!==first.year&&first.value>0?(last.value/first.value-1)*100:null;
 const latestRows=last?rows.filter(r=>r.year===last.year):[];
 const muniTotal=new Map(),cropTotal=new Map();
 latestRows.forEach(r=>{muniTotal.set(r.municipio,(muniTotal.get(r.municipio)||0)+r.value);cropTotal.set(r.name,(cropTotal.get(r.name)||0)+r.value)});
 const topMuni=[...muniTotal].sort((a,b)=>b[1]-a[1]).slice(0,5);
 const topCrop=[...cropTotal].sort((a,b)=>b[1]-a[1]).slice(0,5);
 const table=(label,items)=>items.length?'<section class="lab-report-table-section"><h4>'+esc(label)+'</h4><table><thead><tr><th>Descripción</th><th>Valor nominal (MDP)</th></tr></thead><tbody>'+items.map(([name,value])=>'<tr><td>'+esc(name)+'</td><td>'+f(value)+'</td></tr>').join('')+'</tbody></table></section>':'';
 const report='<div class="lab-document-mark"><span>GROWA / ESTUDIOS ECONÓMICOS</span><span>DOCUMENTO DE APOYO TÉCNICO</span></div>'+
 '<h2>Ficha de diagnóstico agrícola territorial</h2>'+
 '<p class="lab-document-subtitle">Resumen estadístico de consulta personalizada · DGSIAP · Sinaloa 2003–2025</p>'+
 '<div class="lab-document-meta"><div><span>PERIODO CONSULTADO</span><strong>'+firstYear+'–'+lastYear+'</strong></div><div><span>MUNICIPIOS SELECCIONADOS</span><strong>'+(state.municipalities.size?state.municipalities.size:'18 · todos')+'</strong></div><div><span>CULTIVOS SELECCIONADOS</span><strong>'+(state.crops.size?state.crops.size:'todos los reportados')+'</strong></div><div><span>REGISTROS ANALIZADOS</span><strong>'+rows.length.toLocaleString('es-MX')+'</strong></div></div>'+
 '<h3>1. Alcance y criterio de selección</h3><p>Este documento resume observaciones disponibles de valor bruto de la producción agrícola por municipio y cultivo. El ámbito territorial incluye '+(state.municipalities.size?esc([...state.municipalities].sort().join(', ')):'los municipios reportados de Sinaloa')+'. Los cultivos considerados son '+(state.crops.size?esc([...state.crops].sort().join(', ')):'todos los registrados dentro de los filtros')+'.</p>'+
 (has&&last?'<h3>2. Indicadores observados</h3><p>El último cierre con registros en la selección es '+last.year+', con un valor agrícola nominal agregado de <strong>'+f(last.value)+' millones de pesos</strong>.'+(difference!==null?' La variación nominal entre el primer y último cierre observados es de <strong>'+(difference>0?'+':'')+p(difference)+' %</strong>.':'')+' Estas cifras no identifican productividad, ingreso neto ni crecimiento real por sí solas.</p>':'<p>No se registraron observaciones con la combinación seleccionada. No se muestran estimaciones sustitutas.</p>')+
 (has&&last?'<h3>3. Distribución productiva del último cierre</h3>'+table('Municipios principales',topMuni)+table('Cultivos principales',topCrop):'')+
 '<h3>4. Fuente, interpretación y advertencias</h3>'+
 '<p><strong>Fuente:</strong> cierres agrícolas municipales DGSIAP, consolidados en el observatorio Growa Agricultura. <strong>Unidad del valor:</strong> millones de pesos corrientes. <strong>Granularidad:</strong> municipio, cultivo y año; no parcela ni productor individual.</p>'+
 '<p>El análisis refleja la cobertura observada para cada cierre, sin imputar producción cero a observaciones ausentes. Los datos varietales, modalidades de agua, tecnología y destino de mercado solo se encuentran integrados en el cierre 2025. Las participaciones, indicadores HHI y cocientes de localización son descriptivos; no constituyen prueba causal ni valoración de rentabilidad.</p>'+
 '<div class="lab-document-disclaimer">Documento técnico generado a partir de una consulta reproducible. Herramienta independiente de apoyo al análisis: no es un dictamen oficial emitido por la autoridad estadística.</div>';
 $('lab-report-body').innerHTML=report;
 $('lab-report-sheet').hidden=false;
 $('lab-report-sheet').scrollIntoView?.({behavior:'smooth',block:'start'});
}
function runPlanningPreset(mode){
 if(!ready)return;
 state.from=2003;state.to=2025;state.metric='value';state.visual='chart';
 state.municipalities.clear();state.crops.clear();state.compared=[];
 if(mode==='territory'){state.tab='estructura';state.econMode='hhi';state.econYear=2025}
 else if(mode==='compare'){state.tab='comparar';state.compareDimension='municipio';state.compareMode='index'}
 else if(mode==='growth'){state.tab='shapley';if(D.cropNames.includes('Maíz grano'))state.crops.add('Maíz grano');state.shapleyCrop='Maíz grano'}
 else if(mode==='detail'){state.tab='micro2025';state.microMetric='value';state.microMode='raw'}
 else return;
 $('lab-muni-search').value='';$('lab-crop-search').value='';
 $('lab-report-sheet').hidden=true;
 render();
 document.querySelectorAll('[data-lab-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.labPreset===mode)));
 $('lab-content').scrollIntoView?.({behavior:'smooth',block:'start'});
 notify('Consulta de planeación preparada. Puede ajustar los filtros.');
}
function save(){
 const s=snapshot(),label=(state.municipalities.size?[...state.municipalities].slice(0,2).join(', '):'Sinaloa')+' · '+(state.crops.size?[...state.crops].slice(0,2).join(', '):'todos los cultivos')+' · '+state.from+'–'+state.to;
 const items=stored();items.unshift({label,date:new Date().toLocaleDateString('es-MX'),snapshot:s});
 if(saveList(items)){showSaves();notify('Vista guardada en este navegador.')}
}
function share(){
 const url=new URL(location.href);url.searchParams.set('lab',JSON.stringify(snapshot()));url.hash='#laboratorio';
 const val=url.toString();
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(val).then(()=>notify('Enlace compartible copiado.')).catch(()=>notify('Copia la dirección del navegador.'));
 else{const el=document.createElement('textarea');el.value=val;document.body.append(el);el.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}el.remove();notify(ok?'Enlace copiado.':'Copia la dirección desde la barra del navegador.')}
}
function reset(){
 state.municipalities.clear();state.crops.clear();state.from=2003;state.to=2025;state.metric='value';state.tab='serie';state.visual='chart';state.compared=[];state.shapleyCrop='';
 $('lab-muni-search').value='';$('lab-crop-search').value='';
 render();notify('Consulta restablecida.');
}
function context(source){
 if(!ready)return;
 if(source==='states'){
  const x=window.GrowaExplorer?.getContext?.();
  state.municipalities.clear();state.crops.clear();
  if(x?.entity==='Sinaloa'&&x.municipio)state.municipalities.add(x.municipio);
  if(x?.entity==='Sinaloa'&&x.stateCrop)state.crops.add(x.stateCrop);
  if(x?.entity&&x.entity!=='Sinaloa')notify('Esta entidad dispone de un perfil documental; el Laboratorio opera con las series completas de Sinaloa.');
 }else if(source==='crops'){
  const x=window.GrowaExplorer?.getContext?.();
  state.municipalities.clear();state.crops.clear();
  if(x?.scope==='sinaloa'&&x.crop&&D.cropNames.includes(x.crop))state.crops.add(x.crop);
  if(x?.scope==='sinaloa'&&x.cropMuni)state.municipalities.add(x.cropMuni);
  if(x?.scope==='mexico')notify('El cultivo nacional solo tiene un resumen documental. El Laboratorio utilizará los datos históricos de Sinaloa.');
 }
 state.tab='serie';state.visual='chart';state.compared=[];
 render();window.GrowaNavigate('laboratorio');
}
function init(){
 if(ready||!window.GrowaSinaloaData)return;
 D=window.GrowaSinaloaData.D;ready=true;
 const opts=yearOptions();
 $('lab-year-from').innerHTML=htmlOptions(opts,state.from);$('lab-year-to').innerHTML=htmlOptions(opts,state.to);
 $('lab-year-from').addEventListener('change',e=>{state.from=Math.min(Number(e.target.value),state.to);state.econYear=Math.min(Math.max(state.econYear,state.from),state.to);render()});
 $('lab-year-to').addEventListener('change',e=>{state.to=Math.max(Number(e.target.value),state.from);state.econYear=Math.min(Math.max(state.econYear,state.from),state.to);render()});
 $('lab-metric').addEventListener('change',e=>{state.metric=e.target.value;render()});
 $('lab-muni-search').addEventListener('input',()=>addRowChecks('municipalities'));
 $('lab-crop-search').addEventListener('input',()=>addRowChecks('crops'));
 const changeFacet=(e,kind)=>{if(e.target.dataset.labFacet!==(kind==='municipalities'?'muni':'crop'))return;const s=state[kind];if(e.target.checked)s.add(e.target.value);else s.delete(e.target.value);state.compared=[];render()};
 $('lab-muni-options').addEventListener('change',e=>changeFacet(e,'municipalities'));
 $('lab-crop-options').addEventListener('change',e=>changeFacet(e,'crops'));
 $('lab-all-muni').addEventListener('click',()=>{state.municipalities.clear();render()});
 $('lab-all-crops').addEventListener('click',()=>{state.crops.clear();render()});
 document.querySelectorAll('[data-lab-tab]').forEach(b=>b.addEventListener('click',()=>{state.tab=b.dataset.labTab;render()}));
 $('lab-content').addEventListener('change',e=>{
  const id=e.target.id;
  if(id==='lab-cmp-group'){state.compareDimension=e.target.value;state.compared=[]}
  else if(id==='lab-cmp-normalize')state.compareMode=e.target.value;
  else if(id==='lab-pivot-rows'){state.pivotRows=e.target.value;if(state.pivotRows===state.pivotCols)state.pivotCols=state.pivotRows==='year'?'cultivo':'year'}
  else if(id==='lab-pivot-cols'){state.pivotCols=e.target.value;if(state.pivotRows===state.pivotCols)state.pivotRows=state.pivotCols==='year'?'municipio':'year'}
  else if(id==='lab-pivot-mode')state.pivotMode=e.target.value;
  else if(id==='lab-econ-mode')state.econMode=e.target.value;
  else if(id==='lab-econ-year')state.econYear=Number(e.target.value);
  else if(id==='lab-econ-muni')state.econMuni=e.target.value;
  else if(id==='lab-lq-crop')state.lqCrop=e.target.value;
  else if(id==='lab-dec-crop')state.shapleyCrop=e.target.value;
  else if(id==='lab-micro-rows'){state.microRows=e.target.value;if(state.microRows===state.microCols)state.microCols=state.microRows==='Nommunicipio'?'Nommodalidad':'Nommunicipio'}
  else if(id==='lab-micro-cols'){state.microCols=e.target.value;if(state.microRows===state.microCols)state.microRows=state.microCols==='Nommunicipio'?'Nomcultivo':'Nommunicipio'}
  else if(id==='lab-micro-filter-dim'){state.microFilterDim=e.target.value;state.microFilterValue=''}
  else if(id==='lab-micro-filter-value')state.microFilterValue=e.target.value;
  else if(id==='lab-micro-metric')state.microMetric=e.target.value;
  else if(id==='lab-micro-mode')state.microMode=e.target.value;
  else if(e.target.dataset.labComp!==undefined){
   const v=e.target.dataset.labComp;
   if(!state.compared.length){state.compared=comparisonValues(selection(),state.compareDimension).slice(0,4).map(r=>r.name)}
   if(e.target.checked&&!state.compared.includes(v)){
    if(state.compared.length>=4){notify('Puedes comparar hasta cuatro series.');render();return}
    state.compared.push(v)
   }else if(!e.target.checked)state.compared=state.compared.filter(x=>x!==v);
  }else return;
  render();
 });
 $('lab-content').addEventListener('input',e=>{if(e.target.id==='lab-pivot-search'){state.pivotSearch=e.target.value;const focus=e.target.selectionStart;render();const next=$('lab-pivot-search');next?.focus();next?.setSelectionRange(focus,focus)}});
 $('lab-content').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.labVisual){state.visual=b.dataset.labVisual;render()}else if(b.dataset.labExport)downloads(b.dataset.labExport)});
 document.querySelectorAll('[data-lab-preset]').forEach(button=>button.addEventListener('click',()=>runPlanningPreset(button.dataset.labPreset)));
 $('lab-report')?.addEventListener('click',renderInstitutionalReport);
 $('lab-report-close')?.addEventListener('click',()=>{$('lab-report-sheet').hidden=true});
 $('lab-report-print')?.addEventListener('click',()=>{document.body.classList.add('lab-print-sheet');window.print();document.body.classList.remove('lab-print-sheet')});
 $('lab-reset').addEventListener('click',reset);
 $('lab-save').addEventListener('click',save);
 $('lab-share').addEventListener('click',share);
 $('lab-download').addEventListener('click',downloadCurrent);
 $('lab-saved').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.labLoad!==undefined){const item=stored()[Number(b.dataset.labLoad)];if(item){applySnapshot(item.snapshot);render();notify('Consulta recuperada.')}}else if(b.dataset.labDelete!==undefined){const items=stored();items.splice(Number(b.dataset.labDelete),1);saveList(items);showSaves()}});
 $('lab-from-state')?.addEventListener('click',()=>context('states'));
 $('lab-from-crop')?.addEventListener('click',()=>context('crops'));
 try{const value=new URL(location.href).searchParams.get('lab');if(value&&!state.loadedLink){applySnapshot(JSON.parse(value));state.loadedLink=true}}catch(e){}
 render();showSaves();
}
window.GrowaLab={open:context,snapshot,shapley:shapleyContributions,pivotData,concentration};
window.addEventListener('growa:data-ready',init);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


/* GROWA MAPAS AGRICOLAS V1 — datos DGSIAP + ESA WorldCover + límites geoestadísticos */
(function(){
 'use strict';
 const $=(root,sel)=>root.querySelector(sel);
 const fmt=new Intl.NumberFormat('es-MX',{maximumFractionDigits:1});
 const nameKey=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
 const cap=(n,min,max)=>Math.max(min,Math.min(max,n));
 const setup=[{kind:'territorio',year:2025,crop:'',metric:'value'},{kind:'cultivos',year:2025,crop:'Maíz grano',metric:'value'}];
 const bounds=[[22.20,-110.30],[27.90,-105.15]];
 const WMS='https://mapproxy.terrascope.be/mapproxy/service';
 const featureUrl='https://lcidsig.inegi.org.mx/server/rest/services/Hosted/Municipios_2025/FeatureServer/0/query';
 const gbApi='https://www.geoboundaries.org/api/current/gbOpen/MEX/ADM2/';
 let data=null,geometryPromise=null,polygonData=null,installed=false;
 const modules=[];
 const label=(kind)=>kind==='value'?'millones de pesos nominales':'hectáreas reportadas';
 const value=(n,metric)=>metric==='value'?fmt.format(n)+' MDP':fmt.format(n)+' ha';
 function readName(p){
  for(const key of ['NOMGEO','NOM_MUN','NOM_MUNIC','NOM_MUNICIPIO','nom_mun','municipio','MUNICIPIO','shapeName','name','NAME_2','nombre','NOMBRE']){
   if(p[key])return String(p[key]).trim();
  }
  return '';
 }
 function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));}
 function styleFor(v,max){
  if(v===null)return '#a9b8ad';
  const p=max>0?v/max:0;
  return p>.75?'#1f5539':p>.5?'#387951':p>.25?'#69a17a':'#b9d6b6';
 }
 function rowsFor(ctx){
  const grouped=new Map();
  if(!data)return grouped;
  const src=ctx.crop?data.crops.filter(x=>x.year===ctx.year&&x.name===ctx.crop):
    data.municipalities.filter(x=>x.year===ctx.year);
  const field=ctx.metric==='value'?'value':ctx.metric==='harvest'?'harvest':(ctx.crop?'planted':'area');
  for(const item of src){
   const k=ctx.crop?item.municipio:item.name,old=grouped.get(k)||0;
   grouped.set(k,old+(Number(item[field])||0));
  }
  return grouped;
 }
 function loading(ctx,msg){const el=$(ctx.root,'[data-ag-status]');if(el)el.textContent=msg;}
 async function fetchJson(url){
  const response=await fetch(url,{mode:'cors',headers:{'Accept':'application/json'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  return response.json();
 }
 async function boundaries(){
  if(geometryPromise)return geometryPromise;
  geometryPromise=(async()=>{
   const e=new URLSearchParams({where:'1=1',geometry:'-110.3,22.2,-105.15,27.9',geometryType:'esriGeometryEnvelope',inSR:'4326',outSR:'4326',outFields:'*',returnGeometry:'true',f:'geojson'});
   try{
    const j=await fetchJson(featureUrl+'?'+e.toString());
    if(j.type==='FeatureCollection'&&Array.isArray(j.features)&&j.features.length){
     return {features:j.features,source:'INEGI, Municipios 2025'};
    }
   }catch(err){console.warn('Límites INEGI no accesibles, se probará geoBoundaries',err);}
   try{
    const info=await fetchJson(gbApi);
    const u=info.simplifiedGeometryGeoJSON||info.gjDownloadURL;
    if(!u)throw Error('El catálogo no ofrece GeoJSON');
    const j=await fetchJson(u);
    if(j.type==='FeatureCollection'&&j.features?.length)return {features:j.features,source:'geoBoundaries, límites simplificados'};
   }catch(err){console.warn('No se pudieron cargar límites de respaldo',err);}
   return {features:[],source:null};
  })();
  return geometryPromise;
 }
 function matchGeometry(p){
  const n=nameKey(readName(p));
  const found=data.muniNames.find(x=>nameKey(x)===n);
  if(!found)return null;
  // Si algún polígono de otro estado comparte nombre, limitar por caja geográfica en INEGI.
  return found;
 }
 function create(ctx){
  ctx.root=document.querySelector('[data-agrogeo="'+ctx.kind+'"]');
  if(!ctx.root||!window.L||!data)return;
  ctx.root.querySelector('[data-ag-year]').innerHTML=Array.from({length:23},(_,i)=>2025-i).map(y=>'<option value="'+y+'">'+y+'</option>').join('');
  ctx.root.querySelector('[data-ag-crop]').innerHTML='<option value="">Todos los cultivos</option>'+data.cropNames.map(n=>'<option value="'+safe(n)+'">'+safe(n)+'</option>').join('');
  ctx.root.querySelector('[data-ag-year]').value=String(ctx.year);
  ctx.root.querySelector('[data-ag-crop]').value=ctx.crop;
  ctx.root.querySelector('[data-ag-metric]').value=ctx.metric;
  ctx.map=L.map('ag-map-'+ctx.kind,{preferCanvas:true,zoomControl:true,minZoom:5,maxZoom:17}).setView([25.00,-107.65],7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(ctx.map);
  ctx.wms=L.tileLayer.wms(WMS,{layers:'esa-worldcover-map-10m-2021-v2_map',format:'image/png',transparent:true,version:'1.1.1',opacity:.64,attribution:'© ESA WorldCover 2021 / Copernicus, VITO'});
  ctx.wms.on('tileerror',()=>{if(!ctx.wmsError){ctx.wmsError=true;loading(ctx,'El servicio satelital no respondió. El mapa y los datos municipales permanecen disponibles.');}});
  ctx.wms.addTo(ctx.map);
  ctx.polygons=L.layerGroup().addTo(ctx.map);
  ctx.root.querySelector('[data-ag-year]').addEventListener('change',e=>{ctx.year=Number(e.target.value);render(ctx);});
  ctx.root.querySelector('[data-ag-crop]').addEventListener('change',e=>{ctx.crop=e.target.value;render(ctx);});
  ctx.root.querySelector('[data-ag-metric]').addEventListener('change',e=>{ctx.metric=e.target.value;render(ctx);});
  ctx.root.querySelector('[data-ag-world]').addEventListener('change',e=>{
   if(e.target.checked)ctx.wms.addTo(ctx.map);else ctx.map.removeLayer(ctx.wms);
  });
  ctx.root.querySelector('[data-ag-borders]').addEventListener('change',e=>{
   if(e.target.checked)ctx.polygons.addTo(ctx.map);else ctx.map.removeLayer(ctx.polygons);
  });
  ctx.root.querySelector('[data-ag-reset]').addEventListener('click',()=>ctx.map.fitBounds(bounds,{padding:[16,16]}));
  ctx.root.querySelector('[data-ag-download]').addEventListener('click',()=>{
   const d=rowsFor(ctx);
   const csv=[...d].map(([municipio,numero])=>({municipio,anio:ctx.year,cultivo:ctx.crop||'Todos',indicador:ctx.metric,valor:numero,unidad:ctx.metric==='value'?'MDP nominales':'ha'}));
   if(window.GrowaDownloadCSV&&csv.length)window.GrowaDownloadCSV('growa_mapa_'+ctx.kind+'_'+ctx.year+'.csv',csv);
  });
  ctx.root.querySelector('[data-ag-ranking]').addEventListener('click',e=>{
   const b=e.target.closest('button[data-name]');if(!b)return;
   const layer=ctx.locations?.get(b.dataset.name);
   if(layer){ctx.map.fitBounds(layer.getBounds(),{padding:[28,28],maxZoom:10});layer.openPopup();}
  });
  render(ctx);
  boundaries().then(b=>{ctx.geometry=b;installBoundaries(ctx);});
 }
 function installBoundaries(ctx){
  if(!ctx.geometry?.features?.length||!ctx.map){
   loading(ctx,'Sin límites vectoriales disponibles; consulte los valores tabulados. No se inventan contornos.');
   return;
  }
  ctx.polygons.clearLayers();
  ctx.locations=new Map();
  // Filtramos a los 18 municipios históricos del expediente DGSIAP.
  const features=ctx.geometry.features.filter(f=>matchGeometry(f.properties||{}));
  for(const f of features){
   const n=matchGeometry(f.properties||{});
   const lyr=L.geoJSON(f,{style:{color:'#3d6545',weight:1.0,fillColor:'#b9d6b6',fillOpacity:.22},onEachFeature:(_feature,layer)=>{
    layer.bindTooltip(n,{sticky:true});
    layer.on('mouseover',()=>layer.setStyle({weight:2.3}));
    layer.on('mouseout',()=>refreshStyles(ctx));
   }});
   lyr.addTo(ctx.polygons);ctx.locations.set(n,lyr);
  }
  if(ctx.locations.size){loading(ctx,'Límites vinculados: '+ctx.locations.size+' de 18 municipios · '+ctx.geometry.source+'. Las delimitaciones de 2025 no equivalen a las claves estadísticas históricas.');}
  else loading(ctx,'La geometría recibida no coincidió con el catálogo municipal. Se mantienen indicadores, fuente satelital y rankings.');
  render(ctx);
 }
 function refreshStyles(ctx){
  if(!ctx.locations)return;
  const d=rowsFor(ctx),max=Math.max(0,...d.values());
  for(const [name,lyr] of ctx.locations){
   const n=d.has(name)?d.get(name):null;
   lyr.setStyle({color:'#2e6140',weight:1,fillColor:styleFor(n,max),fillOpacity:n===null?.07:.35});
   lyr.bindPopup('<strong>'+safe(name)+'</strong><div class="ag-pop-value">'+(n===null?'Sin observación':safe(value(n,ctx.metric)))+'</div><div class="ag-pop-sub">'+safe(ctx.crop||'Todos los cultivos')+' · '+ctx.year+'<br>'+safe(label(ctx.metric))+'<br>DGSIAP · agregado municipal, no dato por parcela.</div>');
  }
 }
 function render(ctx){
  const grouped=rowsFor(ctx),valid=[...grouped].filter(([_,v])=>Number.isFinite(v)).sort((a,b)=>b[1]-a[1]);
  const total=valid.reduce((s,r)=>s+r[1],0);
  $(ctx.root,'[data-ag-total]').textContent=ctx.crop||'Conjunto de cultivos';
  $(ctx.root,'[data-ag-summary]').textContent=ctx.year+' · '+valid.length+' municipios observados · '+value(total,ctx.metric)+' agregados. '+(ctx.crop?'Cultivo seleccionado.':'Todos los cultivos.');
  const max=Math.max(1,...valid.map(x=>x[1]));
  $(ctx.root,'[data-ag-ranking]').innerHTML=valid.length?valid.map(([name,n])=>'<button type="button" data-name="'+safe(name)+'" title="Ubicar '+safe(name)+' en el mapa"><span class="ag-rank-top"><span>'+safe(name)+'</span><strong>'+safe(value(n,ctx.metric))+'</strong></span><span class="ag-rank-track"><i style="width:'+cap(n/max*100,0,100).toFixed(1)+'%"></i></span></button>').join(''):'<p>Sin observaciones para esta selección.</p>';
  refreshStyles(ctx);
  if(ctx.map){requestAnimationFrame(()=>ctx.map.invalidateSize(false));}
 }
 function sync(ctx){
  if(!window.GrowaExplorer||!ctx.root||!data)return;
  const x=window.GrowaExplorer.getContext();
  if(ctx.kind==='territorio'&&x.entity==='Sinaloa'){
   const y=Number(x.stateYear);
   if(Number.isFinite(y))ctx.year=y;
   ctx.crop=x.stateCrop||'';
  }else if(ctx.kind==='cultivos'&&x.scope==='sinaloa'){
   const y=Number(x.cropYear);
   if(Number.isFinite(y))ctx.year=y;
   if(data.cropNames.includes(x.crop))ctx.crop=x.crop;
  }else return;
  $(ctx.root,'[data-ag-year]').value=ctx.year;
  $(ctx.root,'[data-ag-crop]').value=ctx.crop;
  render(ctx);
  if(ctx.kind==='territorio'&&x.municipio&&ctx.locations?.has(x.municipio)){
   const layer=ctx.locations.get(x.municipio);
   if(ctx.root.closest('section.section-panel')?.hidden===false)ctx.map.fitBounds(layer.getBounds(),{padding:[30,30],maxZoom:10});
  }
 }
 function init(){
  if(installed)return;
  if(!window.GrowaSinaloaData?.D)return;
  data=window.GrowaSinaloaData.D;
  if(!window.L){
   document.querySelectorAll('[data-agrogeo] .ag-map-canvas').forEach(e=>e.innerHTML='<p>No se pudo cargar el motor cartográfico Leaflet. Verifique la conexión.</p>');
   return;
  }
  installed=true;
  for(const ctx of setup){create(ctx);modules.push(ctx);}
  const watchers=[['gx-state-view','territorio'],['gx-crop-view','cultivos']];
  for(const [id,kind] of watchers){
   const el=document.getElementById(id),ctx=modules.find(m=>m.kind===kind);
   if(el&&ctx){let last='';new MutationObserver(()=>{
    const x=window.GrowaExplorer?.getContext();if(!x)return;
    const signature=kind==='territorio'?[x.entity,x.stateYear,x.stateCrop,x.municipio].join('|'):[x.scope,x.crop,x.cropYear].join('|');
    if(last!==signature){last=signature;sync(ctx);}
   }).observe(el,{childList:true,subtree:false});}
  }
  document.addEventListener('click',e=>{
   if(e.target.closest('[data-tab],.nav-link,.gx-choice'))requestAnimationFrame(()=>{for(const ctx of modules)ctx.map?.invalidateSize(false);});
  });
  window.addEventListener('resize',()=>modules.forEach(c=>c.map?.invalidateSize(false)));
 }
 window.addEventListener('growa:data-ready',init);
 document.addEventListener('DOMContentLoaded',init);
 if(document.readyState!=='loading')init();
})();

/* GEOMETRÍA VECTORIAL MUNICIPAL · FALLBACK LOCAL / VISTA DESPLEGADA */
window.GrowaMunicipalGeometry={"type":"FeatureCollection","source":"Límites municipales históricos de México, compilación pública elbic/Mexican-Municipalities (datos geoestadísticos INEGI); generalización geométrica para visualización. No incluye límites de nuevos municipios.","license_note":"Reconocer INEGI y fuente de geometrías; no usar para deslindes jurídicos.","features":[{"type":"Feature","properties":{"name":"Ahome","cvegeo":"25001"},"geometry":{"type":"Polygon","coordinates":[[[-109.00405,26.40009],[-108.94984,26.3922],[-108.94308,26.38846],[-108.93261,26.37668],[-108.93152,26.377],[-108.93159,26.31667],[-108.93272,26.3177],[-108.93286,26.30668],[-108.92952,26.30696],[-108.9277,26.30215],[-108.9329,26.2989],[-108.93298,26.29721],[-108.94996,26.28961],[-108.95157,26.29011],[-108.94711,26.30577],[-108.95243,26.30206],[-108.95213,26.30551],[-108.95816,26.30414],[-108.96324,26.28621],[-108.99314,26.2932],[-109.02666,26.27509],[-109.02367,26.27377],[-109.02421,26.27175],[-109.02669,26.2723],[-109.02833,26.26689],[-109.0321,26.26793],[-109.03821,26.24655],[-109.04258,26.24743],[-109.03194,26.23785],[-109.01554,26.23433],[-109.0134,26.23201],[-109.0089,26.23053],[-109.00791,26.22579],[-109.00395,26.22391],[-108.99229,26.22117],[-109.01638,26.1361],[-109.00245,26.13292],[-108.99972,26.12762],[-108.98702,26.12355],[-108.98525,26.12051],[-108.98524,26.11831],[-108.98262,26.11534],[-108.97845,26.11434],[-108.97231,26.10906],[-108.96628,26.11245],[-108.96481,26.11219],[-108.96925,26.10517],[-108.97323,26.10265],[-108.95811,26.09383],[-109.01786,26.03467],[-108.98782,26.00461],[-108.99649,25.99647],[-108.98815,25.97328],[-108.99602,25.97135],[-108.99461,25.97057],[-108.99589,25.96422],[-108.99842,25.96411],[-109.00558,25.95261],[-109.00631,25.94807],[-109.00942,25.94703],[-109.00952,25.94577],[-109.00807,25.94327],[-109.00115,25.93962],[-108.99974,25.93695],[-108.99246,25.93123],[-108.98106,25.93017],[-108.97389,25.92636],[-108.97631,25.92204],[-108.9822,25.92028],[-108.98171,25.9192],[-108.98395,25.91839],[-108.97631,25.87355],[-108.98032,25.86755],[-108.96444,25.85823],[-108.96626,25.85547],[-108.96146,25.85001],[-108.95105,25.87752],[-108.94301,25.87303],[-108.9403,25.87682],[-108.91459,25.8624],[-108.91117,25.85857],[-108.90644,25.86659],[-108.92243,25.87262],[-108.92322,25.87416],[-108.91721,25.88509],[-108.91889,25.88852],[-108.91512,25.89415],[-108.89551,25.88295],[-108.89852,25.87785],[-108.85462,25.84013],[-108.86664,25.82033],[-108.86302,25.81992],[-108.85908,25.81665],[-108.85369,25.83931],[-108.79315,25.86452],[-108.79147,25.86754],[-108.78524,25.86895],[-108.77827,25.87227],[-108.77716,25.86822],[-108.77057,25.86951],[-108.7699,25.86871],[-108.76088,25.83681],[-108.75788,25.83087],[-108.76191,25.82682],[-108.76607,25.82656],[-108.77216,25.81805],[-108.77491,25.81952],[-108.77764,25.81571],[-108.77953,25.81548],[-108.79435,25.79257],[-108.80751,25.79963],[-108.80946,25.79645],[-108.8111,25.79748],[-108.81388,25.79447],[-108.81493,25.79161],[-108.81597,25.7923],[-108.81989,25.78771],[-108.82457,25.7855],[-108.82955,25.77759],[-108.83002,25.77453],[-108.83281,25.77403],[-108.83056,25.77338],[-108.83243,25.77089],[-108.82678,25.76797],[-108.82936,25.76398],[-108.83199,25.76539],[-108.84025,25.75326],[-108.84001,25.75225],[-108.85272,25.75109],[-108.8644,25.74035],[-108.85381,25.73916],[-108.863,25.72911],[-108.86975,25.71618],[-108.87017,25.71052],[-108.86834,25.71091],[-108.86364,25.64355],[-108.86438,25.64005],[-108.86318,25.62299],[-108.85887,25.62267],[-108.85456,25.61064],[-108.84513,25.59634],[-108.84162,25.58779],[-108.84599,25.58586],[-108.8416,25.57976],[-108.84915,25.5815],[-108.84769,25.58852],[-108.8521,25.59161],[-108.85435,25.59119],[-108.85243,25.58165],[-108.85811,25.57672],[-108.86009,25.5734],[-108.86122,25.5698],[-108.89193,25.51302],[-108.88438,25.50874],[-108.88658,25.49567],[-108.89646,25.48019],[-108.90731,25.44751],[-109.02223,25.44572],[-109.02655,25.44438],[-109.0364,25.46218],[-109.03847,25.46182],[-109.04415,25.46408],[-109.05384,25.47211],[-109.06474,25.48463],[-109.06923,25.48767],[-109.08025,25.49252],[-109.08084,25.49345],[-109.07963,25.49604],[-109.08088,25.49839],[-109.08077,25.50198],[-109.08427,25.50834],[-109.10496,25.52921],[-109.11201,25.53761],[-109.11748,25.54164],[-109.11922,25.545],[-109.16293,25.56083],[-109.16593,25.56999],[-109.17153,25.581],[-109.1777,25.59],[-109.1849,25.5977],[-109.20475,25.61376],[-109.21554,25.62117],[-109.23184,25.62858],[-109.25104,25.63522],[-109.27686,25.64215],[-109.3048,25.646],[-109.33325,25.64712],[-109.35023,25.64407],[-109.37316,25.63762],[-109.39248,25.6372],[-109.39816,25.63868],[-109.39215,25.64282],[-109.3905,25.6696],[-109.39249,25.67707],[-109.3973,25.68098],[-109.39971,25.6854],[-109.39984,25.70051],[-109.40307,25.7172],[-109.40517,25.73601],[-109.40965,25.75475],[-109.41546,25.76873],[-109.42575,25.78774],[-109.4336,25.80941],[-109.43337,25.81167],[-109.43119,25.81351],[-109.42839,25.82031],[-109.42209,25.85033],[-109.41914,25.87396],[-109.42063,25.88148],[-109.4231,25.88604],[-109.42113,25.89389],[-109.42382,25.89623],[-109.42667,25.90263],[-109.43719,25.91673],[-109.44028,25.92347],[-109.44413,25.93961],[-109.44769,25.94899],[-109.44505,25.94995],[-109.44459,25.95198],[-109.4459,25.95454],[-109.44587,25.95716],[-109.43456,25.99943],[-109.40832,26.0585],[-109.40001,26.06951],[-109.38796,26.08834],[-109.38646,26.08802],[-109.38403,26.09054],[-109.35932,26.12433],[-109.33121,26.16729],[-109.31029,26.20249],[-109.29895,26.22639],[-109.29573,26.23628],[-109.28985,26.27408],[-109.2868,26.27942],[-109.28192,26.28299],[-109.25189,26.31218],[-109.25832,26.31993],[-109.24679,26.31604],[-109.234,26.3244],[-109.21564,26.33453],[-109.21361,26.33999],[-109.21128,26.34274],[-109.2039,26.34183],[-109.20254,26.34445],[-109.19856,26.34167],[-109.19313,26.34093],[-109.18913,26.33553],[-109.18882,26.33299],[-109.1894,26.33371],[-109.19027,26.33285],[-109.18817,26.33237],[-109.18499,26.32823],[-109.18204,26.32709],[-109.17801,26.32036],[-109.17458,26.31897],[-109.17531,26.31678],[-109.17403,26.31389],[-109.17126,26.31135],[-109.16695,26.31039],[-109.16494,26.30685],[-109.15907,26.30656],[-109.15694,26.30537],[-109.15428,26.30715],[-109.1496,26.3064],[-109.1354,26.3016],[-109.13471,26.29911],[-109.13312,26.29786],[-109.13093,26.29744],[-109.12745,26.29865],[-109.12524,26.29701],[-109.12101,26.29891],[-109.11966,26.30308],[-109.10011,26.31293],[-109.09668,26.31212],[-109.09336,26.3205],[-109.08727,26.32561],[-109.08754,26.33082],[-109.08541,26.3365],[-109.08122,26.33774],[-109.08038,26.34136],[-109.07803,26.34369],[-109.07421,26.35353],[-109.00615,26.40247],[-109.00405,26.40009]]]}},{"type":"Feature","properties":{"name":"Angostura","cvegeo":"25002"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-108.36666,25.15808],[-108.36607,25.15651],[-108.36127,25.15694],[-108.35979,25.15888],[-108.35845,25.15837],[-108.35472,25.16314],[-108.35391,25.16218],[-108.36067,25.15361],[-108.36947,25.1495],[-108.37182,25.14937],[-108.37866,25.16039],[-108.37885,25.16413],[-108.37706,25.167],[-108.37529,25.16762],[-108.37672,25.16588],[-108.37389,25.16617],[-108.37265,25.16298],[-108.3717,25.16283],[-108.37318,25.16079],[-108.37598,25.16223],[-108.37604,25.16453],[-108.3772,25.16365],[-108.37426,25.15865],[-108.37215,25.15875],[-108.37241,25.15727],[-108.37169,25.15713],[-108.36883,25.16235],[-108.36303,25.16862],[-108.36241,25.16644],[-108.36625,25.16174],[-108.36591,25.15903],[-108.3667,25.15817],[-108.36666,25.15808]]],[[[-108.38176,25.166],[-108.38246,25.16464],[-108.37941,25.16456],[-108.38082,25.16374],[-108.38114,25.16166],[-108.37953,25.15967],[-108.37859,25.16005],[-108.37789,25.15733],[-108.37278,25.14977],[-108.36857,25.14747],[-108.36867,25.1463],[-108.37339,25.1491],[-108.37757,25.15538],[-108.38444,25.16214],[-108.38403,25.16717],[-108.37896,25.17109],[-108.37907,25.16813],[-108.38099,25.16731],[-108.38176,25.166]]],[[[-108.37493,25.17348],[-108.37612,25.16792],[-108.37731,25.173],[-108.37911,25.17127],[-108.37883,25.17581],[-108.38202,25.17974],[-108.38115,25.18242],[-108.37899,25.18323],[-108.38028,25.17981],[-108.37734,25.17792],[-108.37657,25.17548],[-108.37445,25.17378],[-108.37493,25.17348]]],[[[-108.09494,25.44398],[-108.09713,25.43935],[-108.09999,25.43957],[-108.0996,25.4409],[-108.10112,25.44112],[-108.10182,25.44014],[-108.10068,25.43826],[-108.09707,25.43806],[-108.09711,25.43387],[-108.09436,25.4344],[-108.09182,25.43804],[-108.09068,25.43754],[-108.08966,25.43987],[-108.09075,25.44024],[-108.09028,25.44102],[-108.08822,25.43957],[-108.08785,25.43645],[-108.08863,25.43523],[-108.08757,25.43439],[-108.0862,25.43578],[-108.0831,25.43094],[-108.08581,25.43091],[-108.0885,25.42932],[-108.08791,25.42774],[-108.09723,25.4224],[-108.05094,25.39097],[-108.04269,25.39451],[-108.04159,25.39379],[-108.03668,25.3944],[-108.03361,25.39255],[-108.03092,25.38884],[-108.03601,25.38527],[-108.03054,25.38487],[-108.02779,25.38288],[-108.02857,25.38118],[-108.03037,25.38165],[-108.03343,25.3795],[-108.03329,25.37514],[-108.03753,25.36827],[-108.02633,25.36918],[-108.02657,25.36635],[-108.02832,25.36468],[-108.0282,25.3611],[-108.02916,25.35945],[-108.04104,25.36252],[-108.04049,25.35493],[-108.0417,25.35286],[-108.04272,25.35303],[-108.04538,25.34129],[-108.04321,25.34151],[-108.04235,25.33007],[-108.03446,25.32425],[-108.03312,25.30697],[-108.03105,25.30379],[-108.03226,25.30325],[-108.03277,25.30084],[-108.03404,25.30058],[-108.00439,25.26291],[-108.00069,25.25342],[-108.00687,25.25062],[-108.01918,25.24747],[-108.02032,25.24476],[-108.02588,25.24114],[-108.03119,25.24146],[-108.03392,25.23957],[-108.03814,25.23887],[-108.0381,25.236],[-108.03523,25.23649],[-108.03247,25.23399],[-108.03323,25.23257],[-108.01506,25.22013],[-107.99579,25.22022],[-107.99542,25.22206],[-107.993,25.223],[-107.98836,25.22132],[-107.97706,25.19234],[-107.96949,25.18081],[-107.972,25.17706],[-107.9688,25.16466],[-107.97104,25.16364],[-107.96781,25.15612],[-107.97001,25.15431],[-107.98564,25.15828],[-107.98657,25.15747],[-107.98573,25.15749],[-107.98597,25.14995],[-107.98949,25.14988],[-107.99906,25.13403],[-107.99549,25.1341],[-107.99551,25.13169],[-107.95938,25.13179],[-107.95935,25.12728],[-107.95734,25.1271],[-107.9573,25.12264],[-107.95545,25.12255],[-107.95542,25.11806],[-107.95146,25.11807],[-107.95149,25.12261],[-107.9497,25.12254],[-107.9497,25.11454],[-107.93975,25.11455],[-107.93984,25.11357],[-107.93891,25.11358],[-107.93981,25.10928],[-107.93909,25.10673],[-107.93908,25.10528],[-107.93981,25.10528],[-107.93958,25.09113],[-107.94357,25.09098],[-107.94353,25.08648],[-107.9456,25.0865],[-107.94553,25.06848],[-107.93957,25.06847],[-107.93957,25.07029],[-107.93718,25.07027],[-107.93776,25.07664],[-107.93369,25.07752],[-107.9314,25.07025],[-107.92973,25.07585],[-107.92614,25.0784],[-107.92645,25.06863],[-107.929,25.06634],[-107.91971,25.05994],[-107.9197,25.06312],[-107.9123,25.06311],[-107.91167,25.06395],[-107.90987,25.06311],[-107.90985,25.05472],[-107.90791,25.05592],[-107.90683,25.05482],[-107.90724,25.05281],[-107.90823,25.05278],[-107.90783,25.05016],[-107.90708,25.04912],[-107.90613,25.04958],[-107.89564,25.03495],[-107.89614,25.03339],[-107.89509,25.03158],[-107.89952,25.01794],[-107.90947,24.97892],[-107.91367,24.98003],[-107.91367,24.97503],[-107.91497,24.9736],[-107.91523,24.96922],[-107.92008,24.97006],[-107.92428,24.97827],[-107.96778,24.97652],[-107.9637,24.96841],[-107.96888,24.97053],[-107.96953,24.97181],[-107.97282,24.96975],[-107.97547,24.96979],[-107.97575,24.97127],[-107.97413,24.97386],[-107.97117,24.97452],[-107.97318,24.97823],[-107.9802,24.9754],[-107.9816,24.9703],[-107.98403,24.96885],[-107.98543,24.96952],[-107.9885,24.96735],[-107.99542,24.95005],[-108.00951,24.92264],[-108.02435,24.91382],[-108.02503,24.89338],[-108.00804,24.8654],[-108.00421,24.84994],[-108.00922,24.84517],[-108.02189,24.84238],[-108.03463,24.80789],[-108.06991,24.78514],[-108.08997,24.81473],[-108.10657,24.82028],[-108.12176,24.82948],[-108.1244,24.83672],[-108.12387,24.84245],[-108.12579,24.8488],[-108.13621,24.87168],[-108.18367,24.95054],[-108.20506,24.983],[-108.21922,25.00824],[-108.23254,25.02649],[-108.2573,25.05211],[-108.28693,25.07709],[-108.30672,25.09015],[-108.32757,25.1015],[-108.33246,25.10569],[-108.33961,25.11555],[-108.33866,25.12274],[-108.33423,25.12451],[-108.35581,25.16596],[-108.35815,25.16728],[-108.35745,25.16919],[-108.38367,25.18666],[-108.3809,25.1911],[-108.38026,25.19515],[-108.37551,25.20044],[-108.37221,25.21824],[-108.37497,25.22331],[-108.38325,25.22809],[-108.3843,25.22977],[-108.38413,25.23365],[-108.38212,25.23378],[-108.3821,25.23494],[-108.38473,25.23945],[-108.38416,25.24052],[-108.38162,25.24055],[-108.37147,25.24655],[-108.37203,25.25978],[-108.37012,25.26214],[-108.36029,25.2677],[-108.35751,25.27056],[-108.35688,25.27379],[-108.35765,25.28012],[-108.35679,25.28356],[-108.35891,25.28824],[-108.36017,25.28876],[-108.36119,25.28791],[-108.36091,25.28547],[-108.36197,25.28482],[-108.36603,25.28546],[-108.36725,25.28269],[-108.36977,25.28229],[-108.37143,25.28342],[-108.37264,25.28617],[-108.37338,25.29149],[-108.37891,25.29696],[-108.37745,25.30791],[-108.37423,25.3105],[-108.3716,25.31073],[-108.37038,25.31244],[-108.37242,25.31288],[-108.37228,25.31496],[-108.37393,25.3168],[-108.37294,25.33282],[-108.365,25.33627],[-108.36665,25.33791],[-108.3632,25.34513],[-108.36788,25.35653],[-108.36245,25.3584],[-108.36005,25.35672],[-108.35204,25.35753],[-108.346,25.3628],[-108.34422,25.36892],[-108.34075,25.36736],[-108.33978,25.36301],[-108.33767,25.36196],[-108.32913,25.36609],[-108.32416,25.36698],[-108.32075,25.37074],[-108.31891,25.36995],[-108.32,25.36803],[-108.31453,25.36965],[-108.31452,25.36657],[-108.307,25.36651],[-108.30709,25.37367],[-108.29882,25.37098],[-108.29662,25.38092],[-108.29348,25.3803],[-108.29962,25.35185],[-108.29206,25.3488],[-108.29353,25.35303],[-108.29168,25.35208],[-108.29348,25.35369],[-108.29353,25.35922],[-108.28554,25.36005],[-108.28201,25.35867],[-108.27453,25.35963],[-108.27239,25.37136],[-108.26366,25.37254],[-108.26205,25.37026],[-108.25952,25.36139],[-108.25616,25.36187],[-108.23669,25.36962],[-108.23264,25.36982],[-108.23257,25.37638],[-108.23109,25.37766],[-108.23354,25.3796],[-108.21344,25.39289],[-108.18662,25.40813],[-108.19476,25.42537],[-108.18954,25.42643],[-108.18303,25.42534],[-108.18594,25.41175],[-108.18467,25.40917],[-108.17832,25.41362],[-108.17765,25.41311],[-108.169,25.4179],[-108.16806,25.41649],[-108.16658,25.40575],[-108.1776,25.40419],[-108.16985,25.39815],[-108.1626,25.39595],[-108.16169,25.39445],[-108.16056,25.39984],[-108.16173,25.39974],[-108.162,25.4011],[-108.15552,25.40176],[-108.15564,25.40283],[-108.14391,25.41071],[-108.13888,25.42846],[-108.13683,25.42986],[-108.12812,25.43177],[-108.12806,25.43281],[-108.12127,25.43342],[-108.12161,25.43427],[-108.11966,25.43601],[-108.1167,25.43672],[-108.1175,25.44154],[-108.10285,25.45053],[-108.09527,25.44423],[-108.09494,25.44398]]]]}},{"type":"Feature","properties":{"name":"Badiraguato","cvegeo":"25003"},"geometry":{"type":"Polygon","coordinates":[[[-107.43104,26.14286],[-107.43235,26.13825],[-107.41612,26.14122],[-107.34653,26.10952],[-107.32704,26.09089],[-107.30489,26.0764],[-107.30669,26.04878],[-107.27635,26.00198],[-107.27778,26.00038],[-107.27689,25.9999],[-107.27808,25.99799],[-107.27796,25.99563],[-107.27869,25.9959],[-107.27835,25.9942],[-107.28175,25.99228],[-107.28238,25.98992],[-107.28063,25.9884],[-107.28244,25.98574],[-107.28238,25.98319],[-107.28049,25.9807],[-107.28228,25.97799],[-107.2816,25.97737],[-107.28257,25.97538],[-107.28053,25.97284],[-107.28009,25.97023],[-107.28157,25.96826],[-107.28222,25.96219],[-107.2805,25.96091],[-107.28004,25.9581],[-107.2844,25.9566],[-107.28703,25.95398],[-107.29613,25.92479],[-107.24247,25.89237],[-107.2445,25.88741],[-107.24322,25.88523],[-107.24574,25.8835],[-107.24708,25.87992],[-107.24651,25.87777],[-107.24483,25.87814],[-107.24512,25.87715],[-107.24148,25.88101],[-107.23938,25.88038],[-107.22903,25.86974],[-107.22528,25.86862],[-107.21312,25.86189],[-107.20695,25.86392],[-107.20887,25.85631],[-107.2044,25.8567],[-107.19902,25.8532],[-107.19458,25.85231],[-107.0579,25.75737],[-107.06174,25.75385],[-107.06468,25.74816],[-107.06364,25.74433],[-107.06137,25.74444],[-107.06101,25.74303],[-107.06249,25.74267],[-107.0605,25.74],[-107.06095,25.73769],[-107.06474,25.73278],[-107.06428,25.72963],[-107.06538,25.7252],[-107.06438,25.72404],[-107.06222,25.7243],[-107.06196,25.72294],[-107.06422,25.71907],[-107.06038,25.71529],[-107.04808,25.71083],[-107.04711,25.70916],[-107.0469,25.70058],[-107.04313,25.6977],[-107.04076,25.69702],[-107.0316,25.69788],[-107.02529,25.6962],[-107.02002,25.69222],[-107.01717,25.6928],[-107.01504,25.69135],[-107.01068,25.69146],[-107.01062,25.69837],[-107.00552,25.69871],[-107.00429,25.70124],[-107.00477,25.70313],[-107.00056,25.70704],[-106.99141,25.71049],[-106.9903,25.71492],[-106.96532,25.69788],[-106.96915,25.68301],[-106.96595,25.6771],[-106.96694,25.66833],[-106.9944,25.66179],[-106.97329,25.62957],[-107.03416,25.59632],[-107.10999,25.56056],[-107.11308,25.56106],[-107.11318,25.5599],[-107.11448,25.56022],[-107.12113,25.55641],[-107.11953,25.55422],[-107.12209,25.55352],[-107.12456,25.55041],[-107.13117,25.55022],[-107.13255,25.55269],[-107.13826,25.5522],[-107.13935,25.5532],[-107.1384,25.5562],[-107.13875,25.5601],[-107.17007,25.55955],[-107.16919,25.55772],[-107.17388,25.55655],[-107.17261,25.5517],[-107.17517,25.5492],[-107.17159,25.54611],[-107.17183,25.5428],[-107.17617,25.5444],[-107.17688,25.54082],[-107.17374,25.53886],[-107.17345,25.53371],[-107.16951,25.53247],[-107.17071,25.53051],[-107.17425,25.5291],[-107.17464,25.52771],[-107.17212,25.52637],[-107.17201,25.52384],[-107.17597,25.52271],[-107.17514,25.52024],[-107.17812,25.51518],[-107.17211,25.50739],[-107.16629,25.503],[-107.14768,25.50503],[-107.13982,25.49662],[-107.13929,25.48956],[-107.14065,25.4885],[-107.14062,25.48617],[-107.14619,25.48347],[-107.14724,25.47927],[-107.14947,25.47879],[-107.15112,25.4767],[-107.15065,25.47395],[-107.15263,25.4697],[-107.15122,25.46722],[-107.15302,25.46607],[-107.15185,25.46349],[-107.15313,25.46109],[-107.15054,25.45804],[-107.15656,25.45642],[-107.15552,25.44981],[-107.15679,25.44877],[-107.1558,25.44687],[-107.16096,25.4448],[-107.15869,25.44199],[-107.16473,25.43964],[-107.18487,25.43682],[-107.21013,25.4171],[-107.17155,25.32636],[-107.20782,25.33156],[-107.15839,25.26298],[-107.1572,25.26176],[-107.15459,25.26174],[-107.14814,25.25887],[-107.16918,25.25828],[-107.20414,25.27598],[-107.27583,25.27598],[-107.25565,25.23012],[-107.23403,25.15306],[-107.31805,25.16673],[-107.32493,25.16395],[-107.31157,25.17495],[-107.32418,25.19481],[-107.33121,25.2144],[-107.36977,25.21208],[-107.38655,25.19712],[-107.37475,25.18641],[-107.37715,25.18265],[-107.36389,25.17276],[-107.35305,25.17347],[-107.35905,25.1659],[-107.34606,25.16501],[-107.33809,25.17395],[-107.34254,25.16301],[-107.34804,25.15962],[-107.34926,25.14422],[-107.3433,25.12601],[-107.32637,25.1138],[-107.32817,25.11196],[-107.32691,25.11205],[-107.32605,25.11066],[-107.32817,25.11051],[-107.33033,25.10454],[-107.33006,25.10231],[-107.32892,25.10135],[-107.32946,25.10045],[-107.33039,25.10157],[-107.33317,25.10105],[-107.33347,25.09886],[-107.33239,25.09812],[-107.33223,25.09593],[-107.33327,25.09562],[-107.33311,25.0975],[-107.33543,25.09878],[-107.33948,25.09824],[-107.33787,25.09674],[-107.34071,25.09707],[-107.34074,25.09454],[-107.34343,25.09203],[-107.3451,25.09785],[-107.34674,25.0958],[-107.34736,25.0976],[-107.34665,25.10019],[-107.34998,25.0993],[-107.34828,25.10141],[-107.34978,25.10314],[-107.35076,25.10064],[-107.35149,25.1032],[-107.35224,25.10029],[-107.35385,25.10227],[-107.35596,25.10152],[-107.35444,25.0961],[-107.35697,25.09654],[-107.35755,25.06697],[-107.38251,25.07695],[-107.40685,25.08406],[-107.41095,25.08861],[-107.43149,25.09773],[-107.449,25.10887],[-107.45352,25.11603],[-107.46702,25.12231],[-107.47219,25.12129],[-107.49196,25.12176],[-107.52494,25.12038],[-107.51332,25.13577],[-107.51201,25.139],[-107.52289,25.1617],[-107.53841,25.1812],[-107.53864,25.19299],[-107.54878,25.2091],[-107.55606,25.21581],[-107.56518,25.2159],[-107.58041,25.21321],[-107.60366,25.22842],[-107.60841,25.22756],[-107.61225,25.22303],[-107.62938,25.22126],[-107.62882,25.21676],[-107.62991,25.2151],[-107.63713,25.21621],[-107.63795,25.21515],[-107.64579,25.21394],[-107.64876,25.214],[-107.64914,25.21496],[-107.65323,25.21223],[-107.65417,25.20879],[-107.66187,25.21207],[-107.66505,25.21543],[-107.67254,25.21821],[-107.67429,25.21763],[-107.67546,25.21394],[-107.67886,25.21331],[-107.67953,25.21604],[-107.68484,25.21951],[-107.69225,25.22925],[-107.69003,25.2389],[-107.69342,25.24201],[-107.69655,25.24129],[-107.6985,25.24271],[-107.69584,25.24526],[-107.69776,25.24628],[-107.70115,25.25303],[-107.70373,25.25307],[-107.70608,25.25617],[-107.70479,25.25652],[-107.70531,25.2581],[-107.7073,25.25878],[-107.71233,25.26771],[-107.71246,25.27197],[-107.74258,25.27013],[-107.7459,25.27203],[-107.74647,25.30771],[-107.75785,25.29575],[-107.75901,25.29794],[-107.75864,25.30307],[-107.75442,25.30758],[-107.75426,25.30985],[-107.75567,25.31101],[-107.75713,25.30947],[-107.76117,25.30998],[-107.76012,25.30794],[-107.76124,25.30922],[-107.76249,25.30862],[-107.76141,25.30608],[-107.76406,25.3027],[-107.77334,25.30125],[-107.77761,25.29809],[-107.78039,25.29735],[-107.79013,25.29702],[-107.79296,25.29776],[-107.75616,25.34131],[-107.75056,25.33674],[-107.75154,25.34182],[-107.74696,25.34265],[-107.74486,25.34491],[-107.74642,25.34745],[-107.74403,25.34904],[-107.74601,25.35337],[-107.74462,25.35352],[-107.74398,25.35221],[-107.74041,25.35324],[-107.73916,25.35387],[-107.7394,25.35631],[-107.73842,25.35793],[-107.73432,25.35834],[-107.73118,25.35725],[-107.72805,25.36033],[-107.72266,25.36167],[-107.72372,25.36701],[-107.72092,25.37184],[-107.71797,25.37235],[-107.71685,25.37146],[-107.7145,25.37284],[-107.71119,25.37275],[-107.70876,25.37447],[-107.70601,25.3745],[-107.70447,25.37703],[-107.70274,25.3757],[-107.70225,25.37834],[-107.70057,25.37918],[-107.70228,25.38044],[-107.70143,25.3815],[-107.69922,25.38002],[-107.69819,25.38203],[-107.69737,25.3807],[-107.69551,25.3808],[-107.69553,25.38249],[-107.6973,25.38368],[-107.69885,25.38297],[-107.6986,25.38577],[-107.69505,25.38598],[-107.69548,25.38799],[-107.69381,25.38905],[-107.69355,25.39311],[-107.69045,25.39464],[-107.69032,25.40087],[-107.68807,25.40005],[-107.687,25.40226],[-107.6845,25.40245],[-107.68236,25.40493],[-107.67849,25.40472],[-107.67406,25.40744],[-107.67401,25.40864],[-107.67592,25.409],[-107.67685,25.4081],[-107.67981,25.40916],[-107.68688,25.41752],[-107.6913,25.42504],[-107.69438,25.42792],[-107.68463,25.44391],[-107.68611,25.44618],[-107.64653,25.4521],[-107.66322,25.48753],[-107.65603,25.48501],[-107.6495,25.48467],[-107.64898,25.48766],[-107.6457,25.48851],[-107.64589,25.49083],[-107.64425,25.49075],[-107.64008,25.49398],[-107.63974,25.5026],[-107.64162,25.51025],[-107.64075,25.51547],[-107.63808,25.51609],[-107.63882,25.52211],[-107.63551,25.53131],[-107.64095,25.5371],[-107.6386,25.54514],[-107.64002,25.54856],[-107.63908,25.54897],[-107.64028,25.55375],[-107.60956,25.57545],[-107.6084,25.58016],[-107.58933,25.5943],[-107.58632,25.59141],[-107.5852,25.59372],[-107.58597,25.5965],[-107.58001,25.59941],[-107.58185,25.60481],[-107.57836,25.60637],[-107.57835,25.60729],[-107.58265,25.61189],[-107.58602,25.61344],[-107.58793,25.61651],[-107.59176,25.61779],[-107.58576,25.62028],[-107.5858,25.62202],[-107.58785,25.62473],[-107.58384,25.62676],[-107.58485,25.62964],[-107.58259,25.63327],[-107.58472,25.63607],[-107.58077,25.63795],[-107.58028,25.63998],[-107.57674,25.64051],[-107.57576,25.64155],[-107.57943,25.64521],[-107.57957,25.6488],[-107.58248,25.64931],[-107.58555,25.65575],[-107.58461,25.65933],[-107.58525,25.6652],[-107.58301,25.66646],[-107.57957,25.66542],[-107.58113,25.66893],[-107.57863,25.67003],[-107.57618,25.67288],[-107.5735,25.67327],[-107.57124,25.67955],[-107.58894,25.67952],[-107.6298,25.68291],[-107.65182,25.77109],[-107.64652,25.8123],[-107.60451,25.84028],[-107.59688,25.88997],[-107.60415,25.94295],[-107.53384,25.98129],[-107.50941,25.97979],[-107.48994,25.99975],[-107.4913,26.00504],[-107.4956,26.00974],[-107.49557,26.01485],[-107.49737,26.01797],[-107.50656,26.01953],[-107.51018,26.02538],[-107.51744,26.03037],[-107.5156,26.04004],[-107.51844,26.04155],[-107.52407,26.03902],[-107.52822,26.04199],[-107.53568,26.04125],[-107.53671,26.04765],[-107.53875,26.04894],[-107.54613,26.04616],[-107.54679,26.04928],[-107.5435,26.05239],[-107.54258,26.05722],[-107.53589,26.05987],[-107.53504,26.06192],[-107.53298,26.06327],[-107.53051,26.06327],[-107.52728,26.06708],[-107.51942,26.0682],[-107.51379,26.07368],[-107.51167,26.07748],[-107.51276,26.07934],[-107.52404,26.07873],[-107.52808,26.08112],[-107.52843,26.08535],[-107.52534,26.08655],[-107.52193,26.09145],[-107.52002,26.10423],[-107.51695,26.1084],[-107.51334,26.11094],[-107.51019,26.1111],[-107.50783,26.11462],[-107.50448,26.11602],[-107.5005,26.11307],[-107.49374,26.11058],[-107.49059,26.11366],[-107.48526,26.11542],[-107.48531,26.1198],[-107.48005,26.12143],[-107.47775,26.12096],[-107.47715,26.12236],[-107.47792,26.12345],[-107.46956,26.12885],[-107.46202,26.13739],[-107.45798,26.13856],[-107.45097,26.13762],[-107.44771,26.13918],[-107.43353,26.14197],[-107.43104,26.14286]]]}},{"type":"Feature","properties":{"name":"Concordia","cvegeo":"25004"},"geometry":{"type":"Polygon","coordinates":[[[-105.97061,23.76572],[-105.96688,23.76561],[-105.9612,23.76094],[-105.95884,23.75771],[-105.9567,23.75716],[-105.94774,23.75838],[-105.94287,23.76126],[-105.93779,23.7596],[-105.93316,23.75589],[-105.93164,23.75578],[-105.93009,23.75695],[-105.92936,23.75943],[-105.92667,23.76152],[-105.92332,23.7613],[-105.91975,23.75781],[-105.92295,23.75224],[-105.92306,23.74775],[-105.90609,23.7394],[-105.90613,23.73715],[-105.91591,23.72642],[-105.91656,23.71536],[-105.92663,23.68414],[-105.92073,23.65584],[-105.90891,23.58827],[-105.89266,23.55265],[-105.88432,23.59039],[-105.8536,23.59729],[-105.84519,23.58369],[-105.84552,23.60326],[-105.81164,23.61103],[-105.80665,23.58887],[-105.8021,23.58771],[-105.80232,23.5865],[-105.80067,23.58474],[-105.79885,23.58343],[-105.79673,23.58339],[-105.79608,23.58058],[-105.79342,23.57804],[-105.78984,23.57852],[-105.78538,23.57499],[-105.78433,23.57324],[-105.7859,23.56947],[-105.77967,23.56683],[-105.7783,23.56414],[-105.77681,23.56417],[-105.77412,23.5608],[-105.77291,23.561],[-105.77265,23.55786],[-105.77028,23.55766],[-105.76883,23.55565],[-105.76891,23.55311],[-105.76756,23.55155],[-105.76927,23.54855],[-105.76801,23.54566],[-105.76931,23.54389],[-105.76912,23.54194],[-105.76038,23.53511],[-105.75893,23.53201],[-105.75965,23.52688],[-105.75739,23.52621],[-105.7568,23.52448],[-105.75764,23.51948],[-105.75663,23.51555],[-105.76008,23.50914],[-105.76005,23.50251],[-105.75722,23.50249],[-105.75607,23.50134],[-105.75104,23.50027],[-105.75069,23.49803],[-105.74816,23.4951],[-105.74863,23.49367],[-105.74049,23.48927],[-105.73935,23.48534],[-105.73415,23.48238],[-105.7298,23.48233],[-105.72753,23.47851],[-105.72359,23.47524],[-105.72683,23.47086],[-105.72806,23.46682],[-105.72466,23.46081],[-105.72935,23.45785],[-105.72932,23.45389],[-105.73015,23.45284],[-105.73388,23.45218],[-105.73834,23.44838],[-105.73886,23.44521],[-105.7284,23.43959],[-105.72829,23.43763],[-105.73056,23.43401],[-105.72833,23.42898],[-105.72507,23.42856],[-105.72198,23.42645],[-105.71723,23.42707],[-105.71213,23.42551],[-105.70711,23.42585],[-105.70458,23.42485],[-105.70364,23.4223],[-105.70146,23.42157],[-105.70032,23.41969],[-105.704,23.41126],[-105.70915,23.40948],[-105.71025,23.40813],[-105.70859,23.40388],[-105.7118,23.39778],[-105.71208,23.39255],[-105.71709,23.39269],[-105.72242,23.38604],[-105.72246,23.38376],[-105.72027,23.38113],[-105.71729,23.38004],[-105.71733,23.37859],[-105.72329,23.37657],[-105.72806,23.37822],[-105.73052,23.37695],[-105.72995,23.37401],[-105.72325,23.37213],[-105.71804,23.36853],[-105.73857,23.33861],[-105.84895,23.32995],[-105.83876,23.30775],[-105.91729,23.33173],[-105.93055,23.32155],[-105.93986,23.26765],[-105.93304,23.25857],[-105.93569,23.25753],[-105.93647,23.25489],[-105.93607,23.24886],[-105.93299,23.24691],[-105.92935,23.2426],[-105.92813,23.23873],[-105.94923,23.23453],[-105.94343,23.20077],[-105.93835,23.19999],[-105.9372,23.19334],[-105.9227,23.19005],[-105.92645,23.1782],[-105.90992,23.13888],[-105.909,23.11932],[-105.9306,23.11796],[-105.96302,23.08458],[-105.96306,23.08705],[-105.96186,23.08887],[-105.96565,23.09017],[-105.96332,23.09389],[-105.96398,23.09548],[-105.96804,23.09645],[-105.97156,23.10434],[-105.97658,23.10524],[-105.97616,23.10657],[-105.974,23.10753],[-105.97642,23.11152],[-105.97847,23.11821],[-105.98047,23.12015],[-105.98244,23.11571],[-105.97936,23.11238],[-105.98077,23.1083],[-105.98686,23.10632],[-105.99432,23.10657],[-105.99705,23.10497],[-105.99919,23.10495],[-106.00464,23.10114],[-106.00723,23.10177],[-106.0078,23.10078],[-106.01035,23.10045],[-106.01174,23.09727],[-106.0131,23.09653],[-106.02668,23.10885],[-106.03846,23.11553],[-106.04566,23.10531],[-106.0606,23.11448],[-106.06356,23.11322],[-106.06565,23.11467],[-106.06776,23.11359],[-106.069,23.11491],[-106.07064,23.114],[-106.06918,23.10936],[-106.0725,23.10872],[-106.07659,23.10605],[-106.0776,23.10691],[-106.07909,23.10264],[-106.07689,23.09928],[-106.07766,23.09827],[-106.09271,23.11079],[-106.10233,23.09549],[-106.09634,23.08979],[-106.10583,23.07598],[-106.13076,23.09888],[-106.11989,23.11471],[-106.11014,23.13233],[-106.10649,23.14019],[-106.10679,23.14299],[-106.10408,23.14479],[-106.10264,23.1479],[-106.09875,23.14973],[-106.09902,23.15168],[-106.09576,23.15501],[-106.09608,23.15602],[-106.10102,23.15883],[-106.0998,23.16017],[-106.10318,23.16153],[-106.10409,23.15991],[-106.10551,23.15983],[-106.10592,23.16132],[-106.10775,23.16115],[-106.10851,23.16246],[-106.11174,23.16106],[-106.11435,23.16191],[-106.11632,23.16065],[-106.1204,23.16105],[-106.12127,23.16169],[-106.12099,23.16426],[-106.12343,23.16265],[-106.12717,23.16562],[-106.13428,23.1664],[-106.13917,23.17614],[-106.13981,23.18299],[-106.13633,23.18258],[-106.14707,23.19027],[-106.19613,23.18961],[-106.19579,23.19156],[-106.20074,23.19068],[-106.19941,23.19773],[-106.19999,23.1988],[-106.20558,23.19961],[-106.19486,23.20659],[-106.19183,23.20651],[-106.18875,23.20798],[-106.18613,23.20753],[-106.18511,23.21313],[-106.15946,23.21381],[-106.1746,23.30393],[-106.18508,23.31045],[-106.18566,23.3272],[-106.18961,23.32667],[-106.19472,23.32746],[-106.19825,23.32918],[-106.2001,23.32833],[-106.20366,23.32989],[-106.20929,23.32993],[-106.21132,23.3307],[-106.21411,23.33411],[-106.21744,23.33269],[-106.22037,23.3345],[-106.21993,23.33618],[-106.22125,23.33793],[-106.22001,23.33964],[-106.22173,23.34423],[-106.22614,23.3428],[-106.22671,23.34425],[-106.23193,23.34719],[-106.23217,23.35382],[-106.2429,23.35208],[-106.23872,23.35632],[-106.22909,23.35768],[-106.22911,23.35946],[-106.23189,23.3626],[-106.2369,23.36535],[-106.2352,23.36813],[-106.22941,23.3705],[-106.20968,23.37082],[-106.20868,23.3725],[-106.21134,23.37891],[-106.21059,23.38512],[-106.21849,23.3932],[-106.22095,23.39455],[-106.22242,23.39707],[-106.22158,23.39888],[-106.21172,23.40003],[-106.20675,23.40497],[-106.20895,23.41233],[-106.21121,23.41507],[-106.21155,23.42217],[-106.21716,23.43278],[-106.23356,23.43791],[-106.23695,23.44627],[-106.23364,23.45098],[-106.23142,23.4522],[-106.22687,23.45095],[-106.22206,23.45195],[-106.21675,23.45114],[-106.21078,23.45377],[-106.20812,23.4618],[-106.21222,23.46586],[-106.21171,23.46958],[-106.20743,23.47036],[-106.20334,23.4685],[-106.2007,23.47006],[-106.20107,23.47475],[-106.20496,23.47734],[-106.20568,23.48201],[-106.20415,23.48375],[-106.19808,23.4836],[-106.19731,23.48437],[-106.19955,23.48894],[-106.19923,23.49367],[-106.20013,23.49582],[-106.19926,23.49774],[-106.19971,23.50015],[-106.19694,23.5046],[-106.19838,23.51385],[-106.19527,23.51793],[-106.19084,23.51927],[-106.18637,23.52605],[-106.18444,23.52535],[-106.1839,23.52601],[-106.18539,23.53743],[-106.18657,23.53946],[-106.19124,23.54216],[-106.19283,23.54642],[-106.19302,23.5487],[-106.19106,23.55258],[-106.18396,23.55338],[-106.18075,23.5549],[-106.17986,23.55681],[-106.18068,23.56083],[-106.17428,23.56637],[-106.16771,23.56446],[-106.1641,23.5594],[-106.15649,23.55786],[-106.15284,23.55515],[-106.15005,23.5554],[-106.14382,23.56362],[-106.14841,23.56683],[-106.15461,23.57371],[-106.15266,23.57755],[-106.15219,23.58175],[-106.14861,23.58374],[-106.13269,23.58006],[-106.12276,23.57617],[-106.12081,23.57452],[-106.12123,23.5681],[-106.11926,23.56721],[-106.1164,23.56792],[-106.11414,23.57221],[-106.10994,23.5759],[-106.10459,23.57846],[-106.10567,23.58272],[-106.11129,23.5838],[-106.11255,23.58549],[-106.11058,23.59232],[-106.11238,23.5954],[-106.11093,23.60005],[-106.10878,23.60064],[-106.10857,23.60196],[-106.10748,23.60224],[-106.10033,23.59828],[-106.09375,23.59848],[-106.08868,23.60385],[-106.08514,23.60433],[-106.0851,23.60737],[-106.0921,23.61399],[-106.09447,23.61811],[-106.09232,23.62295],[-106.08995,23.62153],[-106.08701,23.61535],[-106.08099,23.61304],[-106.07901,23.61306],[-106.07663,23.61628],[-106.07374,23.61657],[-106.06652,23.61132],[-106.06239,23.61203],[-106.06062,23.61578],[-106.06478,23.62112],[-106.06752,23.62699],[-106.06523,23.63174],[-106.06193,23.63276],[-106.06161,23.63565],[-106.06448,23.63982],[-106.0689,23.64146],[-106.06915,23.64355],[-106.06456,23.64881],[-106.06295,23.65308],[-106.057,23.65333],[-106.04974,23.64873],[-106.04525,23.65374],[-106.042,23.65569],[-106.03673,23.65219],[-106.03334,23.65374],[-106.03376,23.65658],[-106.03794,23.65672],[-106.03951,23.65971],[-106.0386,23.66209],[-106.03409,23.66436],[-106.03505,23.67043],[-106.03763,23.67262],[-106.04272,23.67207],[-106.04418,23.67596],[-106.04204,23.67926],[-106.03461,23.68118],[-106.03236,23.68127],[-106.02903,23.67871],[-106.02395,23.67743],[-106.02087,23.68197],[-106.02048,23.68676],[-106.02211,23.69075],[-106.01641,23.69586],[-106.01434,23.70093],[-106.022,23.70409],[-106.02504,23.70783],[-106.02633,23.71192],[-106.02449,23.71403],[-106.01991,23.71637],[-106.01744,23.71612],[-106.01623,23.71354],[-106.01305,23.71284],[-106.00875,23.71713],[-106.00513,23.71888],[-106.00745,23.72496],[-106.00533,23.73204],[-106.00597,23.7355],[-106.01146,23.73969],[-106.01324,23.74512],[-106.00985,23.74836],[-106.00015,23.75103],[-105.99607,23.74742],[-105.99136,23.74639],[-105.98915,23.74756],[-105.98647,23.75136],[-105.98489,23.75736],[-105.97766,23.76049],[-105.97602,23.76584],[-105.97274,23.76653],[-105.97118,23.76579],[-105.97061,23.76572]]]}},{"type":"Feature","properties":{"name":"Cosalá","cvegeo":"25005"},"geometry":{"type":"Polygon","coordinates":[[[-106.79613,24.75336],[-106.79301,24.74391],[-106.78425,24.74146],[-106.71513,24.67208],[-106.71149,24.6703],[-106.70595,24.66526],[-106.68905,24.62375],[-106.68361,24.59853],[-106.64546,24.52898],[-106.63778,24.53031],[-106.63224,24.52999],[-106.62261,24.5249],[-106.63007,24.5065],[-106.62736,24.50323],[-106.62477,24.50024],[-106.60999,24.49785],[-106.60036,24.48321],[-106.59934,24.48484],[-106.60011,24.48661],[-106.59846,24.48712],[-106.59909,24.49099],[-106.59737,24.49092],[-106.59709,24.4926],[-106.59618,24.4924],[-106.59587,24.49383],[-106.59365,24.49506],[-106.59157,24.49143],[-106.58712,24.49264],[-106.58376,24.49076],[-106.58006,24.48724],[-106.57866,24.48222],[-106.5762,24.48188],[-106.57317,24.47763],[-106.56981,24.47681],[-106.56869,24.47531],[-106.56711,24.47588],[-106.56684,24.47426],[-106.56483,24.4734],[-106.56002,24.47271],[-106.55945,24.46965],[-106.56284,24.45878],[-106.56832,24.4531],[-106.56927,24.44619],[-106.56763,24.44217],[-106.56868,24.44205],[-106.56928,24.43702],[-106.60159,24.41457],[-106.59529,24.40947],[-106.58347,24.39027],[-106.58596,24.379],[-106.53409,24.30955],[-106.53324,24.30267],[-106.52799,24.29512],[-106.51709,24.28698],[-106.5091,24.29114],[-106.46286,24.26971],[-106.46377,24.26852],[-106.46312,24.23804],[-106.48521,24.23998],[-106.48549,24.23824],[-106.48819,24.23908],[-106.48765,24.23755],[-106.49145,24.23839],[-106.49379,24.23702],[-106.49444,24.23509],[-106.4957,24.23582],[-106.49683,24.23461],[-106.49851,24.23491],[-106.50155,24.23238],[-106.50509,24.23284],[-106.5059,24.23116],[-106.50403,24.22936],[-106.50742,24.22924],[-106.51044,24.22394],[-106.51304,24.22536],[-106.51402,24.22826],[-106.51743,24.22478],[-106.52439,24.22717],[-106.52601,24.2235],[-106.52817,24.22688],[-106.53201,24.22812],[-106.53567,24.22586],[-106.53575,24.22384],[-106.53824,24.22481],[-106.54226,24.22388],[-106.54442,24.22552],[-106.54633,24.22439],[-106.54804,24.22539],[-106.54899,24.22497],[-106.54879,24.22255],[-106.55127,24.22387],[-106.552,24.22698],[-106.55641,24.22635],[-106.55947,24.22404],[-106.56119,24.22638],[-106.56743,24.22507],[-106.57198,24.22871],[-106.57626,24.22995],[-106.5805,24.22976],[-106.58626,24.23258],[-106.59072,24.23333],[-106.5933,24.23571],[-106.60486,24.23811],[-106.60621,24.23721],[-106.60572,24.23443],[-106.60965,24.23314],[-106.61039,24.23069],[-106.61191,24.22998],[-106.6117,24.22847],[-106.61342,24.22786],[-106.61096,24.22496],[-106.61128,24.22093],[-106.60721,24.22022],[-106.60489,24.22147],[-106.60304,24.22095],[-106.60378,24.21851],[-106.60592,24.21638],[-106.66415,24.22504],[-106.67443,24.22579],[-106.70808,24.2331],[-106.711,24.23099],[-106.71501,24.22571],[-106.71419,24.22422],[-106.71568,24.22334],[-106.71492,24.22054],[-106.71675,24.2185],[-106.71643,24.21656],[-106.71747,24.21576],[-106.71877,24.21658],[-106.72277,24.21388],[-106.72266,24.21835],[-106.72441,24.22074],[-106.73012,24.22067],[-106.73345,24.22253],[-106.73365,24.22816],[-106.73557,24.22838],[-106.74134,24.22452],[-106.74528,24.23219],[-106.74497,24.23587],[-106.74617,24.23691],[-106.74703,24.24541],[-106.75078,24.24921],[-106.75591,24.24968],[-106.75906,24.25194],[-106.75656,24.2585],[-106.75774,24.26015],[-106.75889,24.26059],[-106.76246,24.25671],[-106.76586,24.25697],[-106.7685,24.26039],[-106.77352,24.26232],[-106.77358,24.26457],[-106.77711,24.26461],[-106.77754,24.26671],[-106.77612,24.27063],[-106.77395,24.27271],[-106.7793,24.28289],[-106.78067,24.2825],[-106.7939,24.28716],[-106.84662,24.26866],[-106.88647,24.28106],[-106.88913,24.28404],[-106.91321,24.27617],[-106.94886,24.30051],[-106.93995,24.32501],[-106.95898,24.35774],[-106.99263,24.36768],[-107.01846,24.39684],[-107.01763,24.39848],[-107.01927,24.39971],[-107.01936,24.40143],[-107.01735,24.40961],[-107.01855,24.41197],[-107.02363,24.41425],[-107.02474,24.41881],[-107.02656,24.42036],[-107.0273,24.42587],[-107.02886,24.42616],[-107.0309,24.42883],[-107.03076,24.43069],[-107.03269,24.43132],[-107.03295,24.43317],[-107.04623,24.42816],[-107.05103,24.45198],[-107.05128,24.4714],[-107.05556,24.47923],[-107.05422,24.48192],[-107.05261,24.48307],[-107.04506,24.48412],[-107.03881,24.48645],[-107.0275,24.48451],[-107.02252,24.48517],[-107.02151,24.48605],[-107.0225,24.48991],[-107.02178,24.49265],[-106.99857,24.4975],[-106.98969,24.50311],[-106.96478,24.50743],[-106.9743,24.54297],[-107.02271,24.55403],[-107.02382,24.56089],[-107.02107,24.5661],[-107.01558,24.56805],[-107.01447,24.57578],[-107.01694,24.58282],[-107.02048,24.589],[-107.02061,24.59275],[-107.0234,24.59944],[-107.03,24.60521],[-107.03352,24.61061],[-107.04225,24.64321],[-107.03947,24.64659],[-107.03493,24.64732],[-107.03311,24.65037],[-107.029,24.65105],[-107.02887,24.65324],[-107.02512,24.65663],[-107.02761,24.65485],[-107.02865,24.65511],[-107.02851,24.65616],[-107.02566,24.65842],[-107.02145,24.65578],[-107.01789,24.64883],[-107.01882,24.64719],[-107.01618,24.64648],[-107.01681,24.6533],[-107.04055,24.68183],[-107.01279,24.715],[-107.01222,24.7179],[-107.00508,24.71681],[-107.00426,24.72068],[-106.9987,24.72686],[-106.99136,24.72615],[-106.98676,24.72746],[-106.97931,24.72312],[-106.9753,24.72303],[-106.97382,24.72563],[-106.9712,24.72517],[-106.96862,24.72632],[-106.96873,24.72782],[-106.97104,24.72967],[-106.96939,24.73389],[-106.96216,24.73486],[-106.95582,24.73794],[-106.953,24.73664],[-106.94987,24.73839],[-106.94795,24.7371],[-106.94866,24.7388],[-106.94699,24.74196],[-106.9474,24.74419],[-106.9455,24.74279],[-106.94592,24.76449],[-106.90671,24.76788],[-106.87376,24.79703],[-106.87116,24.80935],[-106.886,24.82635],[-106.86782,24.82416],[-106.86102,24.81836],[-106.79613,24.75336]]]}},{"type":"Feature","properties":{"name":"Culiacán","cvegeo":"25006"},"geometry":{"type":"Polygon","coordinates":[[[-107.16918,25.25828],[-107.14834,25.25916],[-107.12106,25.24311],[-107.13168,25.2322],[-107.13199,25.23127],[-107.13042,25.22948],[-107.13202,25.22671],[-107.13538,25.22534],[-107.14877,25.22455],[-107.12901,25.1884],[-107.12492,25.18664],[-107.12989,25.05314],[-107.0674,25.03016],[-107.06357,25.02526],[-107.06642,25.02292],[-107.0665,25.0204],[-107.06201,25.01245],[-107.06042,25.00243],[-107.05728,24.9987],[-107.01834,24.93362],[-107.02515,24.92838],[-107.02105,24.90991],[-107.00058,24.92824],[-106.97325,24.90961],[-106.95101,24.888],[-106.94628,24.88895],[-106.93451,24.88054],[-106.93062,24.87347],[-106.93286,24.87148],[-106.92708,24.86662],[-106.95142,24.85902],[-106.95083,24.85795],[-106.94639,24.85851],[-106.94396,24.85153],[-106.94314,24.84306],[-106.94649,24.83975],[-106.93806,24.83525],[-106.93066,24.82092],[-106.91928,24.81395],[-106.90295,24.82839],[-106.886,24.82635],[-106.87116,24.80935],[-106.87376,24.79703],[-106.90671,24.76788],[-106.94592,24.76449],[-106.9455,24.74279],[-106.9474,24.74419],[-106.94699,24.74196],[-106.94866,24.7388],[-106.94795,24.7371],[-106.94987,24.73839],[-106.953,24.73664],[-106.95582,24.73794],[-106.96216,24.73486],[-106.96939,24.73389],[-106.97104,24.72967],[-106.96873,24.72782],[-106.96862,24.72632],[-106.9712,24.72517],[-106.97382,24.72563],[-106.9753,24.72303],[-106.97931,24.72312],[-106.98676,24.72746],[-106.99136,24.72615],[-106.99757,24.72706],[-106.99888,24.72675],[-107.00426,24.72068],[-107.00508,24.71681],[-107.01222,24.7179],[-107.01279,24.715],[-107.04055,24.68183],[-107.01681,24.6533],[-107.01618,24.64648],[-107.01882,24.64719],[-107.01789,24.64883],[-107.02145,24.65578],[-107.02566,24.65842],[-107.02851,24.65616],[-107.02865,24.65511],[-107.02761,24.65485],[-107.02512,24.65663],[-107.02887,24.65324],[-107.029,24.65105],[-107.03311,24.65037],[-107.03493,24.64732],[-107.03947,24.64659],[-107.04225,24.64321],[-107.03352,24.61061],[-107.03,24.60521],[-107.0234,24.59944],[-107.02061,24.59275],[-107.02048,24.589],[-107.01694,24.58282],[-107.01447,24.57578],[-107.01558,24.56805],[-107.02107,24.5661],[-107.02382,24.56089],[-107.02271,24.55403],[-106.9743,24.54297],[-106.96478,24.50743],[-106.98969,24.50311],[-106.99857,24.4975],[-107.02178,24.49265],[-107.0225,24.48991],[-107.02151,24.48605],[-107.02252,24.48517],[-107.0275,24.48451],[-107.03881,24.48645],[-107.04506,24.48412],[-107.05261,24.48307],[-107.05422,24.48192],[-107.05556,24.47923],[-107.05128,24.4714],[-107.05103,24.45198],[-107.04623,24.42816],[-107.03295,24.43317],[-107.03269,24.43132],[-107.03076,24.43069],[-107.0309,24.42883],[-107.02886,24.42616],[-107.0273,24.42587],[-107.02656,24.42036],[-107.02474,24.41881],[-107.02363,24.41425],[-107.01855,24.41197],[-107.01735,24.40961],[-107.01936,24.40143],[-107.01927,24.39971],[-107.01763,24.39848],[-107.01846,24.39684],[-106.99263,24.36768],[-106.95898,24.35774],[-106.93995,24.32501],[-106.94886,24.30051],[-106.91321,24.27617],[-106.9139,24.26566],[-106.91892,24.26713],[-106.92077,24.24982],[-106.92474,24.24434],[-106.9259,24.24038],[-106.9251,24.23197],[-106.92866,24.22587],[-106.93413,24.22337],[-106.93767,24.22723],[-106.93926,24.22363],[-106.93774,24.22344],[-106.93677,24.22186],[-106.93667,24.21977],[-106.93334,24.21425],[-106.93362,24.21241],[-106.92914,24.2106],[-106.9264,24.19986],[-106.93102,24.1944],[-106.93576,24.19247],[-106.93917,24.18708],[-106.9404,24.17961],[-106.93708,24.17184],[-106.93767,24.16819],[-106.94132,24.16638],[-106.94232,24.1647],[-106.94252,24.15625],[-106.9472,24.15451],[-106.95139,24.15575],[-106.95338,24.15742],[-106.95314,24.15924],[-106.95116,24.16092],[-106.9498,24.16411],[-106.98718,24.15818],[-107.00009,24.16329],[-107.00006,24.16697],[-107.01195,24.15939],[-107.02709,24.15888],[-107.02885,24.16177],[-107.03426,24.16052],[-107.03369,24.15862],[-107.04573,24.15855],[-107.04922,24.14666],[-107.03538,24.1284],[-107.05027,24.1164],[-107.02791,24.08505],[-107.03262,24.08497],[-107.03019,24.08046],[-107.02622,24.07754],[-107.02369,24.07916],[-107.01618,24.06731],[-107.04282,24.06717],[-107.04835,24.06624],[-107.05619,24.0623],[-107.05951,24.06437],[-107.06419,24.06541],[-107.06598,24.06191],[-107.05982,24.0582],[-107.06046,24.05409],[-107.05922,24.05425],[-107.05929,24.05355],[-107.06219,24.05146],[-107.06212,24.04877],[-107.06134,24.04702],[-107.05752,24.0445],[-107.0577,24.0409],[-107.05679,24.03973],[-107.06206,24.04205],[-107.06386,24.04105],[-107.06617,24.04239],[-107.06889,24.04613],[-107.07319,24.04765],[-107.0758,24.05035],[-107.0813,24.05302],[-107.08325,24.0548],[-107.08372,24.05877],[-107.08661,24.05968],[-107.09354,24.06854],[-107.09663,24.06978],[-107.10327,24.06976],[-107.11207,24.07334],[-107.11853,24.07907],[-107.12437,24.08118],[-107.12603,24.08422],[-107.12628,24.08916],[-107.1282,24.09468],[-107.13089,24.09497],[-107.133,24.09325],[-107.13762,24.09337],[-107.14084,24.09509],[-107.14448,24.09356],[-107.14615,24.09386],[-107.15161,24.09715],[-107.15182,24.09858],[-107.15399,24.0987],[-107.15985,24.10379],[-107.16494,24.10397],[-107.16488,24.0989],[-107.16242,24.09926],[-107.15734,24.09446],[-107.15355,24.09405],[-107.1505,24.09144],[-107.14766,24.09074],[-107.14448,24.08541],[-107.13771,24.0833],[-107.13611,24.08108],[-107.1352,24.07705],[-107.13189,24.077],[-107.12502,24.07426],[-107.12013,24.06989],[-107.11775,24.06497],[-107.11434,24.06428],[-107.11033,24.06137],[-107.10923,24.05118],[-107.11015,24.05059],[-107.11121,24.05182],[-107.11103,24.05107],[-107.1042,24.04393],[-107.10787,24.04023],[-107.11007,24.04102],[-107.11258,24.03971],[-107.10998,24.03928],[-107.11175,24.03469],[-107.16767,24.07681],[-107.19003,24.09154],[-107.1948,24.09638],[-107.1954,24.09819],[-107.19399,24.102],[-107.19953,24.10685],[-107.20714,24.11036],[-107.24335,24.13275],[-107.33022,24.18919],[-107.40748,24.23356],[-107.41044,24.23701],[-107.41083,24.24166],[-107.4401,24.26558],[-107.47501,24.2922],[-107.54232,24.3374],[-107.64945,24.407],[-107.72717,24.45449],[-107.76004,24.47189],[-107.77499,24.47837],[-107.79569,24.48547],[-107.80008,24.488],[-107.80612,24.49269],[-107.81215,24.50117],[-107.81291,24.50712],[-107.81051,24.51008],[-107.82313,24.52242],[-107.80048,24.52603],[-107.61729,24.41734],[-107.53649,24.45596],[-107.54003,24.51746],[-107.53746,24.52208],[-107.53773,24.52594],[-107.52899,24.53194],[-107.52826,24.53361],[-107.5308,24.53759],[-107.53363,24.53982],[-107.53351,24.57229],[-107.52368,24.57231],[-107.52368,24.59016],[-107.51383,24.59012],[-107.51375,24.6178],[-107.51255,24.61951],[-107.50365,24.67177],[-107.4663,24.67215],[-107.46897,24.6834],[-107.46172,24.68342],[-107.46117,24.69759],[-107.45288,24.69752],[-107.45297,24.71018],[-107.46706,24.71276],[-107.46749,24.7112],[-107.47137,24.71111],[-107.47126,24.71308],[-107.47402,24.71374],[-107.474,24.74456],[-107.47704,24.7447],[-107.47776,24.75287],[-107.49005,24.76164],[-107.50463,24.76758],[-107.50645,24.77181],[-107.50848,24.77176],[-107.50848,24.77003],[-107.51236,24.76976],[-107.51233,24.76147],[-107.51321,24.76147],[-107.51332,24.77132],[-107.51726,24.77093],[-107.51738,24.77227],[-107.54003,24.77032],[-107.54521,24.78466],[-107.54897,24.78295],[-107.55131,24.78951],[-107.55259,24.78955],[-107.55318,24.79548],[-107.55225,24.79923],[-107.55347,24.80163],[-107.56237,24.79911],[-107.56246,24.80462],[-107.56596,24.80319],[-107.58558,24.8012],[-107.58425,24.80914],[-107.59799,24.80997],[-107.5969,24.81558],[-107.58535,24.81456],[-107.58529,24.82251],[-107.59768,24.8226],[-107.59875,24.83143],[-107.61252,24.83161],[-107.60994,24.85557],[-107.64854,24.87158],[-107.64734,24.87356],[-107.68263,24.88968],[-107.72303,24.91603],[-107.71985,24.91953],[-107.72529,24.92339],[-107.7248,24.92525],[-107.72303,24.92757],[-107.70141,24.92249],[-107.70006,24.92556],[-107.69793,24.92624],[-107.69149,24.92553],[-107.68882,24.92828],[-107.68513,24.92545],[-107.68167,24.92895],[-107.67032,24.93122],[-107.66448,24.93135],[-107.66187,24.92877],[-107.65847,24.92763],[-107.65694,24.92872],[-107.65683,24.92757],[-107.64803,24.93706],[-107.65272,24.94074],[-107.65135,24.94165],[-107.64647,24.93887],[-107.64476,24.94305],[-107.64239,24.94558],[-107.64248,24.94756],[-107.64347,24.94801],[-107.6418,24.95796],[-107.63956,24.95904],[-107.63927,24.96132],[-107.63694,24.96133],[-107.63642,24.96284],[-107.62693,24.96646],[-107.62288,24.97443],[-107.61905,24.97426],[-107.61584,24.97065],[-107.61049,24.97326],[-107.60752,24.97197],[-107.60024,24.97293],[-107.58918,24.97769],[-107.58623,24.98446],[-107.57982,24.98649],[-107.57963,24.9879],[-107.58493,24.98998],[-107.58799,24.9943],[-107.59665,24.9927],[-107.59094,25.00245],[-107.58809,25.01753],[-107.59154,25.03848],[-107.55781,25.0703],[-107.5275,25.0791],[-107.52364,25.08747],[-107.52368,25.09058],[-107.52995,25.11572],[-107.52494,25.12038],[-107.49196,25.12176],[-107.47219,25.12129],[-107.46702,25.12231],[-107.45352,25.11603],[-107.449,25.10887],[-107.43149,25.09773],[-107.41095,25.08861],[-107.40685,25.08406],[-107.38251,25.07695],[-107.35755,25.06697],[-107.35697,25.09654],[-107.35444,25.0961],[-107.35596,25.10152],[-107.35385,25.10227],[-107.35224,25.10029],[-107.35149,25.1032],[-107.35076,25.10064],[-107.34978,25.10314],[-107.34828,25.10141],[-107.34998,25.0993],[-107.34665,25.10019],[-107.34736,25.0976],[-107.34674,25.0958],[-107.3451,25.09785],[-107.34343,25.09203],[-107.34074,25.09454],[-107.34071,25.09707],[-107.33787,25.09674],[-107.33948,25.09824],[-107.33543,25.09878],[-107.33311,25.0975],[-107.33327,25.09562],[-107.33223,25.09593],[-107.33239,25.09812],[-107.33347,25.09886],[-107.33317,25.10105],[-107.33039,25.10157],[-107.32946,25.10045],[-107.32892,25.10135],[-107.33006,25.10231],[-107.33033,25.10454],[-107.32817,25.11051],[-107.32605,25.11066],[-107.32691,25.11205],[-107.32817,25.11196],[-107.32637,25.1138],[-107.3433,25.12601],[-107.34926,25.14422],[-107.34804,25.15962],[-107.34254,25.16301],[-107.33809,25.17395],[-107.34606,25.16501],[-107.35905,25.1659],[-107.35305,25.17347],[-107.36389,25.17276],[-107.37715,25.18265],[-107.37475,25.18641],[-107.38655,25.19712],[-107.36977,25.21208],[-107.33121,25.2144],[-107.32418,25.19481],[-107.31157,25.17495],[-107.32493,25.16395],[-107.31805,25.16673],[-107.23403,25.15306],[-107.25565,25.23012],[-107.27583,25.27598],[-107.20414,25.27598],[-107.16918,25.25828]]]}},{"type":"Feature","properties":{"name":"Choix","cvegeo":"25007"},"geometry":{"type":"Polygon","coordinates":[[[-108.47551,27.03995],[-108.47194,27.0306],[-108.46994,27.03128],[-108.4704,27.03422],[-108.46953,27.03587],[-108.46431,27.0401],[-108.45895,27.03462],[-108.45778,27.02894],[-108.45479,27.02704],[-108.44807,27.02918],[-108.4431,27.0295],[-108.43718,27.02666],[-108.42524,27.02396],[-108.41945,27.02048],[-108.41373,27.02016],[-108.40993,27.01608],[-108.40964,27.0134],[-108.37164,27.02301],[-108.35011,27.02255],[-108.34765,27.01836],[-108.34099,27.01367],[-108.33853,27.00896],[-108.33333,27.0046],[-108.32997,27.00561],[-108.32761,27.00773],[-108.32491,27.00621],[-108.32203,27.00894],[-108.32225,27.01446],[-108.32524,27.01756],[-108.32598,27.02049],[-108.32271,27.02767],[-108.31868,27.03068],[-108.31656,27.03449],[-108.31013,27.03548],[-108.30743,27.03485],[-108.30339,27.03662],[-108.30162,27.03326],[-108.29929,27.03221],[-108.29463,27.02587],[-108.29085,27.02554],[-108.28891,27.02658],[-108.29093,27.01483],[-108.28422,27.01247],[-108.28161,27.01317],[-108.2807,27.01478],[-108.27395,27.0189],[-108.27313,27.02249],[-108.27022,27.02368],[-108.26988,27.02512],[-108.26293,27.02676],[-108.26303,27.02895],[-108.26046,27.02932],[-108.26085,27.03313],[-108.25819,27.03371],[-108.25859,27.03527],[-108.25045,27.04103],[-108.24617,27.03881],[-108.24294,27.04205],[-108.24122,27.04185],[-108.23214,27.0316],[-108.22585,27.02722],[-108.22114,27.02773],[-108.21947,27.02909],[-108.21472,27.03022],[-108.21255,27.03423],[-108.21114,27.03426],[-108.20955,27.03229],[-108.20543,27.03257],[-108.20284,27.03066],[-108.20064,27.03205],[-108.19949,27.03517],[-108.1977,27.03471],[-108.19427,27.03195],[-108.19445,27.02893],[-108.19182,27.02589],[-108.19324,27.02532],[-108.19486,27.02623],[-108.19443,27.02424],[-108.1936,27.02224],[-108.19254,27.02247],[-108.19273,27.02139],[-108.19016,27.01974],[-108.18948,27.01454],[-108.18675,27.01217],[-108.18728,27.01027],[-108.1836,27.00906],[-108.18392,27.00668],[-108.18028,27.00016],[-108.18189,26.99946],[-108.18193,26.99658],[-108.18362,26.99531],[-108.18152,26.99411],[-108.18245,26.99302],[-108.18628,26.99311],[-108.18613,26.99175],[-108.1885,26.98888],[-108.18789,26.98636],[-108.18958,26.98679],[-108.18973,26.98559],[-108.19135,26.98564],[-108.19459,26.98356],[-108.19705,26.9838],[-108.19691,26.98112],[-108.19879,26.98093],[-108.20127,26.98302],[-108.20471,26.98029],[-108.20797,26.98106],[-108.20683,26.98257],[-108.20738,26.98311],[-108.20905,26.98046],[-108.21085,26.98038],[-108.21089,26.97799],[-108.21583,26.97768],[-108.21512,26.97409],[-108.21639,26.97357],[-108.21533,26.9704],[-108.21898,26.9719],[-108.21837,26.96479],[-108.2263,26.96364],[-108.23206,26.96108],[-108.23502,26.95862],[-108.23549,26.95347],[-108.23051,26.94796],[-108.23103,26.94348],[-108.22925,26.94267],[-108.22934,26.94145],[-108.23139,26.94071],[-108.22877,26.93857],[-108.23042,26.93696],[-108.23102,26.9328],[-108.22938,26.93062],[-108.22625,26.92953],[-108.22502,26.92288],[-108.2278,26.91803],[-108.22734,26.9144],[-108.22866,26.91283],[-108.22853,26.91031],[-108.23024,26.90572],[-108.22067,26.8978],[-108.21444,26.88801],[-108.20972,26.88544],[-108.20621,26.88555],[-108.20353,26.88767],[-108.20278,26.89062],[-108.20796,26.90462],[-108.20739,26.906],[-108.2059,26.90633],[-108.20236,26.90379],[-108.19767,26.90267],[-108.19419,26.89855],[-108.19008,26.89587],[-108.18708,26.89726],[-108.18567,26.89971],[-108.18392,26.89974],[-108.1811,26.89654],[-108.17758,26.8822],[-108.17455,26.88146],[-108.17144,26.88393],[-108.17175,26.89234],[-108.16856,26.89507],[-108.16586,26.89588],[-108.15987,26.89476],[-108.15591,26.89522],[-108.15317,26.89769],[-108.14755,26.90851],[-108.14538,26.90886],[-108.1431,26.90788],[-108.14152,26.90585],[-108.142,26.89776],[-108.1396,26.89548],[-108.14425,26.86765],[-108.09411,26.87046],[-108.08456,26.86134],[-108.02682,26.79847],[-108.03765,26.76978],[-108.01426,26.77315],[-108.0057,26.76105],[-108.01372,26.75031],[-108.01524,26.73705],[-108.01923,26.73067],[-108.01085,26.72565],[-108.0088,26.72331],[-108.00671,26.71478],[-108.00765,26.70801],[-108.00679,26.70553],[-108.00855,26.70373],[-108.00897,26.70158],[-108.0079,26.69933],[-108.01172,26.69361],[-108.01175,26.68948],[-108.01492,26.68759],[-108.01428,26.68604],[-108.01943,26.68354],[-108.0209,26.68095],[-108.02367,26.67859],[-108.02546,26.67836],[-108.02658,26.67523],[-108.02848,26.67353],[-108.03032,26.67426],[-108.03172,26.66798],[-108.03446,26.66816],[-108.03908,26.6663],[-108.04269,26.66676],[-108.04313,26.66323],[-108.04498,26.66276],[-108.04653,26.65979],[-108.05028,26.65963],[-108.05301,26.65832],[-108.05298,26.65638],[-108.05595,26.65647],[-108.05631,26.65559],[-108.05502,26.65475],[-108.05628,26.6519],[-108.05852,26.65075],[-108.0602,26.65157],[-108.06465,26.64737],[-108.06643,26.64826],[-108.06706,26.64693],[-108.07058,26.6473],[-108.0713,26.64605],[-108.07279,26.64718],[-108.07674,26.64532],[-108.07793,26.64617],[-108.08065,26.64451],[-108.0816,26.64199],[-108.07443,26.63645],[-108.07389,26.63369],[-108.07607,26.63023],[-108.07456,26.62799],[-108.07172,26.62692],[-108.06882,26.63145],[-108.06701,26.63031],[-108.06299,26.63043],[-108.06126,26.62724],[-108.05867,26.62659],[-108.05651,26.62773],[-108.0539,26.62717],[-108.05284,26.62947],[-108.05158,26.62984],[-108.05014,26.62792],[-108.04453,26.62497],[-108.04515,26.61971],[-108.03746,26.61971],[-108.03388,26.6163],[-108.03181,26.61592],[-108.03544,26.60972],[-108.03361,26.60777],[-108.03251,26.60318],[-108.0271,26.5985],[-108.02028,26.597],[-108.01217,26.5914],[-108.01078,26.58838],[-108.01289,26.58193],[-108.01248,26.57964],[-108.00401,26.57347],[-108.001,26.57256],[-107.99708,26.5671],[-107.99765,26.56471],[-107.99205,26.56228],[-107.9899,26.55358],[-107.99082,26.54988],[-107.98974,26.54804],[-107.9876,26.5459],[-107.98364,26.54604],[-107.98168,26.54288],[-107.97969,26.54318],[-107.97751,26.53611],[-107.97044,26.53289],[-107.964,26.52745],[-107.96102,26.52696],[-107.96214,26.524],[-107.96106,26.5202],[-107.96199,26.5178],[-107.95964,26.51439],[-107.95881,26.51012],[-107.95612,26.50806],[-107.95547,26.50542],[-107.95807,26.49686],[-107.95727,26.49374],[-107.96025,26.49197],[-107.97052,26.48907],[-107.98504,26.47378],[-107.98562,26.4721],[-107.96964,26.47017],[-107.99937,26.44845],[-108.01434,26.45328],[-108.01939,26.44949],[-108.01391,26.39045],[-108.03661,26.3689],[-108.03088,26.33886],[-108.03926,26.33084],[-108.05312,26.31358],[-108.08538,26.30882],[-108.09002,26.31076],[-108.09221,26.31032],[-108.09772,26.31189],[-108.11147,26.29829],[-108.11546,26.29965],[-108.11938,26.29968],[-108.12307,26.30161],[-108.12801,26.29938],[-108.131,26.30112],[-108.1369,26.30005],[-108.14213,26.30111],[-108.14655,26.30037],[-108.15464,26.30233],[-108.15792,26.29736],[-108.158,26.29516],[-108.15489,26.28638],[-108.16566,26.28382],[-108.17294,26.28991],[-108.17587,26.29514],[-108.18145,26.29259],[-108.18881,26.29402],[-108.20743,26.30343],[-108.21714,26.30689],[-108.21891,26.31054],[-108.21911,26.3157],[-108.22117,26.32121],[-108.22046,26.32477],[-108.20584,26.32246],[-108.202,26.33284],[-108.19881,26.34854],[-108.19586,26.34948],[-108.19196,26.35646],[-108.19207,26.35983],[-108.18674,26.37366],[-108.20493,26.37402],[-108.2145,26.364],[-108.22055,26.37769],[-108.26259,26.38479],[-108.26262,26.36326],[-108.28624,26.37095],[-108.30104,26.37373],[-108.30471,26.40375],[-108.30433,26.41262],[-108.30784,26.42459],[-108.31029,26.44066],[-108.28823,26.44241],[-108.26051,26.45659],[-108.29716,26.45226],[-108.30496,26.47189],[-108.31368,26.48046],[-108.31514,26.48726],[-108.31956,26.48999],[-108.32493,26.49002],[-108.32669,26.49097],[-108.33721,26.48723],[-108.33838,26.47831],[-108.35584,26.47809],[-108.36101,26.48966],[-108.36508,26.49084],[-108.36648,26.47814],[-108.37222,26.47711],[-108.37436,26.47572],[-108.3862,26.4916],[-108.39244,26.48362],[-108.40401,26.50668],[-108.40628,26.50729],[-108.40888,26.51052],[-108.41424,26.51],[-108.41844,26.51194],[-108.41766,26.51696],[-108.4193,26.52073],[-108.42256,26.52183],[-108.42124,26.52329],[-108.42168,26.52907],[-108.4245,26.53346],[-108.42857,26.53254],[-108.43457,26.53427],[-108.43625,26.5335],[-108.43921,26.53691],[-108.44538,26.53468],[-108.44879,26.536],[-108.4509,26.53387],[-108.45331,26.53523],[-108.45649,26.53419],[-108.4603,26.5365],[-108.46493,26.53763],[-108.45739,26.54371],[-108.45612,26.54807],[-108.44771,26.55191],[-108.44219,26.55314],[-108.43729,26.56307],[-108.43122,26.56969],[-108.43973,26.58632],[-108.42709,26.58593],[-108.41864,26.59226],[-108.41789,26.59728],[-108.41187,26.60162],[-108.40951,26.60195],[-108.4053,26.59714],[-108.40309,26.59864],[-108.39109,26.61454],[-108.38592,26.61631],[-108.38787,26.61777],[-108.40354,26.64359],[-108.43549,26.64452],[-108.43488,26.63671],[-108.4398,26.63165],[-108.44169,26.62548],[-108.44643,26.62074],[-108.44656,26.61665],[-108.46915,26.6108],[-108.46758,26.6029],[-108.46929,26.60312],[-108.47263,26.59907],[-108.49148,26.60096],[-108.5014,26.60997],[-108.50427,26.60866],[-108.50838,26.61078],[-108.50823,26.60739],[-108.50612,26.60628],[-108.50525,26.60298],[-108.50829,26.60312],[-108.51073,26.60462],[-108.51166,26.6036],[-108.5138,26.60611],[-108.51536,26.60605],[-108.51639,26.60787],[-108.51836,26.60622],[-108.52118,26.61023],[-108.51846,26.61223],[-108.51923,26.61448],[-108.52112,26.61335],[-108.52077,26.61205],[-108.52229,26.61062],[-108.52507,26.6129],[-108.52201,26.61474],[-108.52241,26.61609],[-108.5208,26.61668],[-108.52151,26.61813],[-108.51924,26.62062],[-108.51879,26.62297],[-108.52035,26.62645],[-108.52379,26.62948],[-108.52861,26.62787],[-108.53375,26.6239],[-108.53185,26.62102],[-108.53669,26.6111],[-108.53377,26.61291],[-108.53064,26.61177],[-108.52721,26.61232],[-108.52323,26.60994],[-108.52267,26.60819],[-108.52375,26.6076],[-108.52374,26.60525],[-108.52249,26.60415],[-108.5206,26.60466],[-108.51941,26.60078],[-108.52277,26.59708],[-108.52148,26.59176],[-108.52263,26.59085],[-108.5205,26.58696],[-108.52134,26.58419],[-108.5195,26.58079],[-108.52969,26.58398],[-108.52977,26.57711],[-108.57028,26.55966],[-108.57391,26.56106],[-108.57514,26.56065],[-108.57522,26.55941],[-108.58127,26.55955],[-108.58371,26.56326],[-108.5861,26.56299],[-108.58752,26.56419],[-108.58806,26.56327],[-108.58597,26.56092],[-108.5868,26.55925],[-108.58951,26.56274],[-108.5921,26.56183],[-108.59553,26.56641],[-108.59813,26.5664],[-108.59475,26.56818],[-108.59535,26.57045],[-108.60286,26.56728],[-108.60533,26.56881],[-108.60292,26.56923],[-108.60134,26.57316],[-108.60093,26.57477],[-108.60247,26.57807],[-108.60062,26.58042],[-108.60218,26.58195],[-108.60137,26.58381],[-108.60587,26.58519],[-108.60708,26.58425],[-108.60943,26.58541],[-108.6084,26.58661],[-108.61469,26.58927],[-108.61508,26.59115],[-108.61738,26.58928],[-108.61867,26.59159],[-108.61289,26.59355],[-108.61153,26.59752],[-108.61508,26.59948],[-108.61481,26.59481],[-108.61722,26.59418],[-108.6197,26.59695],[-108.61812,26.599],[-108.61893,26.6041],[-108.61964,26.60323],[-108.62473,26.60661],[-108.6342,26.60889],[-108.63494,26.61029],[-108.63388,26.61381],[-108.6311,26.6161],[-108.63088,26.61943],[-108.62722,26.62132],[-108.63107,26.62348],[-108.63348,26.62689],[-108.63581,26.62667],[-108.6379,26.62978],[-108.63105,26.63312],[-108.63168,26.63486],[-108.6306,26.6358],[-108.6305,26.63932],[-108.62284,26.63849],[-108.61838,26.63987],[-108.61895,26.64207],[-108.61795,26.64456],[-108.62014,26.64756],[-108.62425,26.64986],[-108.63205,26.65064],[-108.63315,26.64979],[-108.66364,26.658],[-108.66147,26.66453],[-108.65768,26.66913],[-108.63037,26.67657],[-108.6337,26.67957],[-108.62987,26.68049],[-108.6318,26.6872],[-108.63599,26.69052],[-108.6312,26.70144],[-108.63147,26.70697],[-108.62838,26.71839],[-108.61773,26.722],[-108.6177,26.72513],[-108.61625,26.72646],[-108.60102,26.72722],[-108.59871,26.73272],[-108.59721,26.74322],[-108.59886,26.75031],[-108.59522,26.75524],[-108.59419,26.75917],[-108.58161,26.7591],[-108.57994,26.75997],[-108.57833,26.76278],[-108.57874,26.77269],[-108.57737,26.77572],[-108.57794,26.77654],[-108.57598,26.77776],[-108.58085,26.78958],[-108.5752,26.79322],[-108.56477,26.77848],[-108.55791,26.78022],[-108.55403,26.77986],[-108.55147,26.78154],[-108.54982,26.78756],[-108.5419,26.79287],[-108.53691,26.79843],[-108.53644,26.80175],[-108.53792,26.80412],[-108.54766,26.80583],[-108.55535,26.81158],[-108.55786,26.81731],[-108.55704,26.82375],[-108.55405,26.82671],[-108.54704,26.82856],[-108.54568,26.8298],[-108.54574,26.83202],[-108.54217,26.83432],[-108.54215,26.83584],[-108.5392,26.83673],[-108.53513,26.84098],[-108.53402,26.84415],[-108.53312,26.84439],[-108.52206,26.87968],[-108.52004,26.88023],[-108.51942,26.87901],[-108.51804,26.88042],[-108.51824,26.88155],[-108.46698,26.9707],[-108.42427,26.97623],[-108.49954,26.98628],[-108.50249,26.98736],[-108.50419,26.99243],[-108.50176,26.99666],[-108.50449,27.00234],[-108.50625,27.0029],[-108.5046,27.00456],[-108.50444,27.00718],[-108.5022,27.00407],[-108.50087,27.00444],[-108.50157,27.0084],[-108.49779,27.01042],[-108.4973,27.01341],[-108.48881,27.01628],[-108.48697,27.01534],[-108.48417,27.01744],[-108.48351,27.02115],[-108.48538,27.02783],[-108.48685,27.02955],[-108.49173,27.03138],[-108.48704,27.03253],[-108.48778,27.03566],[-108.48576,27.0375],[-108.48172,27.03801],[-108.47997,27.03959],[-108.47735,27.03882],[-108.47585,27.04],[-108.47551,27.03995]]]}},{"type":"Feature","properties":{"name":"Elota","cvegeo":"25008"},"geometry":{"type":"Polygon","coordinates":[[[-106.7939,24.28716],[-106.78067,24.2825],[-106.7793,24.28289],[-106.77395,24.27271],[-106.77612,24.27063],[-106.77754,24.26671],[-106.77711,24.26461],[-106.77358,24.26457],[-106.77352,24.26232],[-106.7685,24.26039],[-106.76586,24.25697],[-106.76246,24.25671],[-106.75889,24.26059],[-106.75774,24.26015],[-106.75656,24.2585],[-106.75906,24.25194],[-106.75591,24.24968],[-106.75078,24.24921],[-106.74703,24.24541],[-106.74617,24.23691],[-106.74497,24.23587],[-106.74528,24.23219],[-106.74134,24.22452],[-106.73557,24.22838],[-106.73365,24.22816],[-106.73345,24.22253],[-106.73012,24.22067],[-106.72441,24.22074],[-106.72266,24.21835],[-106.72277,24.21388],[-106.71877,24.21658],[-106.71747,24.21576],[-106.71643,24.21656],[-106.71675,24.2185],[-106.71492,24.22054],[-106.71568,24.22334],[-106.71419,24.22422],[-106.71501,24.22571],[-106.711,24.23099],[-106.70808,24.2331],[-106.67443,24.22579],[-106.66415,24.22504],[-106.60592,24.21638],[-106.60758,24.2149],[-106.61038,24.21476],[-106.61061,24.21279],[-106.60901,24.2113],[-106.60589,24.21118],[-106.60471,24.20757],[-106.60675,24.20442],[-106.62099,24.19945],[-106.61904,24.19727],[-106.61843,24.1942],[-106.62113,24.19142],[-106.62059,24.1848],[-106.62379,24.17893],[-106.62583,24.17733],[-106.62904,24.17725],[-106.63075,24.17599],[-106.62946,24.1709],[-106.63515,24.16817],[-106.63486,24.1642],[-106.63201,24.16017],[-106.63439,24.15602],[-106.63785,24.156],[-106.64346,24.15997],[-106.64724,24.1575],[-106.64812,24.15443],[-106.65291,24.15285],[-106.6543,24.1512],[-106.65415,24.14837],[-106.65257,24.14539],[-106.64561,24.14],[-106.64832,24.13619],[-106.65326,24.1357],[-106.6565,24.13675],[-106.66111,24.14429],[-106.66429,24.14567],[-106.6683,24.14244],[-106.66351,24.13814],[-106.66466,24.13696],[-106.664,24.13489],[-106.66815,24.13837],[-106.66873,24.13628],[-106.67063,24.13698],[-106.67524,24.13437],[-106.67394,24.13219],[-106.67547,24.13059],[-106.67762,24.13158],[-106.68712,24.12903],[-106.68865,24.13084],[-106.69197,24.12995],[-106.69004,24.12661],[-106.69067,24.12602],[-106.69355,24.12662],[-106.6942,24.12805],[-106.69629,24.12804],[-106.69606,24.12506],[-106.69472,24.12365],[-106.69571,24.12043],[-106.69305,24.12087],[-106.68187,24.11902],[-106.67876,24.11629],[-106.67764,24.10859],[-106.6806,24.1014],[-106.67667,24.09667],[-106.6748,24.09037],[-106.66261,24.08577],[-106.65869,24.0822],[-106.65378,24.06958],[-106.65335,24.0648],[-106.65487,24.06014],[-106.65929,24.05809],[-106.65767,24.05289],[-106.65568,24.05125],[-106.65474,24.04808],[-106.65694,24.04426],[-106.66371,24.04078],[-106.66597,24.03605],[-106.67064,24.03185],[-106.67786,24.03074],[-106.68006,24.0234],[-106.67856,24.02091],[-106.67538,24.01855],[-106.6754,24.01712],[-106.6799,24.01269],[-106.68233,24.00563],[-106.68148,24.00428],[-106.68199,24.00183],[-106.68527,23.99754],[-106.68839,23.98562],[-106.69106,23.9609],[-106.69426,23.95914],[-106.6961,23.96075],[-106.6991,23.96075],[-106.70407,23.95761],[-106.70657,23.96029],[-106.70795,23.96384],[-106.71249,23.96621],[-106.71489,23.96407],[-106.71524,23.96198],[-106.71398,23.95896],[-106.71066,23.95921],[-106.70892,23.95798],[-106.70315,23.94488],[-106.69657,23.95036],[-106.69042,23.94913],[-106.67192,23.9238],[-106.67055,23.91957],[-106.67691,23.90632],[-106.68554,23.89358],[-106.73564,23.85332],[-106.73171,23.83442],[-106.73742,23.83318],[-106.74289,23.80264],[-106.73794,23.80063],[-106.74006,23.78929],[-106.86193,23.77435],[-106.87169,23.7861],[-106.88204,23.79577],[-106.88378,23.80101],[-106.88257,23.80489],[-106.88506,23.81192],[-106.88551,23.82083],[-106.8874,23.83],[-106.8909,23.8388],[-106.8933,23.8417],[-106.9483,23.8945],[-107.0116,23.9528],[-107.0558,23.9897],[-107.11614,24.03736],[-107.11175,24.03469],[-107.10998,24.03928],[-107.11258,24.03971],[-107.11007,24.04102],[-107.10787,24.04023],[-107.1042,24.04393],[-107.11103,24.05107],[-107.11121,24.05182],[-107.11015,24.05059],[-107.10923,24.05118],[-107.11033,24.06137],[-107.11434,24.06428],[-107.11775,24.06497],[-107.12013,24.06989],[-107.12502,24.07426],[-107.13189,24.077],[-107.1352,24.07705],[-107.13611,24.08108],[-107.13771,24.0833],[-107.14448,24.08541],[-107.14766,24.09074],[-107.1505,24.09144],[-107.15355,24.09405],[-107.15734,24.09446],[-107.16242,24.09926],[-107.16488,24.0989],[-107.16528,24.10321],[-107.16369,24.10429],[-107.15985,24.10379],[-107.15399,24.0987],[-107.15182,24.09858],[-107.15161,24.09715],[-107.14615,24.09386],[-107.14448,24.09356],[-107.14084,24.09509],[-107.13762,24.09337],[-107.133,24.09325],[-107.13089,24.09497],[-107.1282,24.09468],[-107.12628,24.08916],[-107.12603,24.08422],[-107.12437,24.08118],[-107.11853,24.07907],[-107.11207,24.07334],[-107.10327,24.06976],[-107.09663,24.06978],[-107.09354,24.06854],[-107.08661,24.05968],[-107.08372,24.05877],[-107.08325,24.0548],[-107.0813,24.05302],[-107.0758,24.05035],[-107.07319,24.04765],[-107.06889,24.04613],[-107.06617,24.04239],[-107.06386,24.04105],[-107.06206,24.04205],[-107.05679,24.03973],[-107.0577,24.0409],[-107.05752,24.0445],[-107.06134,24.04702],[-107.06212,24.04877],[-107.06219,24.05146],[-107.05929,24.05355],[-107.05922,24.05425],[-107.06046,24.05409],[-107.05982,24.0582],[-107.06598,24.06191],[-107.06419,24.06541],[-107.05951,24.06437],[-107.05619,24.0623],[-107.04835,24.06624],[-107.04282,24.06717],[-107.01618,24.06731],[-107.02369,24.07916],[-107.02622,24.07754],[-107.03019,24.08046],[-107.03262,24.08497],[-107.02791,24.08505],[-107.05027,24.1164],[-107.03538,24.1284],[-107.04922,24.14666],[-107.04573,24.15855],[-107.03369,24.15862],[-107.03426,24.16052],[-107.02885,24.16177],[-107.02709,24.15888],[-107.01195,24.15939],[-107.00006,24.16697],[-107.00009,24.16329],[-106.98718,24.15818],[-106.9498,24.16411],[-106.95116,24.16092],[-106.95314,24.15924],[-106.95264,24.15656],[-106.9472,24.15451],[-106.94252,24.15625],[-106.94232,24.1647],[-106.94132,24.16638],[-106.93845,24.16716],[-106.93715,24.17055],[-106.9404,24.17961],[-106.93917,24.18708],[-106.93576,24.19247],[-106.93102,24.1944],[-106.9264,24.19986],[-106.92914,24.2106],[-106.93362,24.21241],[-106.93334,24.21425],[-106.93667,24.21977],[-106.93677,24.22186],[-106.93774,24.22344],[-106.93926,24.22363],[-106.93767,24.22723],[-106.93413,24.22337],[-106.92866,24.22587],[-106.9251,24.23197],[-106.9259,24.24038],[-106.92474,24.24434],[-106.92077,24.24982],[-106.91892,24.26713],[-106.9139,24.26566],[-106.91321,24.27617],[-106.88913,24.28404],[-106.88647,24.28106],[-106.84662,24.26866],[-106.7939,24.28716]]]}},{"type":"Feature","properties":{"name":"Escuinapa","cvegeo":"25009"},"geometry":{"type":"Polygon","coordinates":[[[-105.75239,22.9605],[-105.67871,22.89415],[-105.65608,22.88173],[-105.65822,22.90174],[-105.64477,22.89989],[-105.64048,22.89789],[-105.63154,22.8974],[-105.62975,22.89794],[-105.62933,22.89952],[-105.62664,22.8994],[-105.61981,22.89663],[-105.61953,22.89744],[-105.61803,22.8973],[-105.61786,22.90302],[-105.61926,22.90808],[-105.60854,22.91395],[-105.60317,22.91471],[-105.60046,22.92019],[-105.59886,22.91933],[-105.59495,22.91494],[-105.59014,22.90449],[-105.59373,22.90373],[-105.59495,22.89982],[-105.59709,22.89803],[-105.59535,22.89678],[-105.5925,22.89005],[-105.58795,22.885],[-105.585,22.88401],[-105.58495,22.88011],[-105.57744,22.87912],[-105.57957,22.87379],[-105.57824,22.87068],[-105.56823,22.87036],[-105.56396,22.8717],[-105.56127,22.86964],[-105.55815,22.87227],[-105.55394,22.87112],[-105.55027,22.87298],[-105.54882,22.86873],[-105.5451,22.86639],[-105.54535,22.86409],[-105.53995,22.86324],[-105.54034,22.86097],[-105.53646,22.85184],[-105.53254,22.85171],[-105.52959,22.84837],[-105.53211,22.84633],[-105.53214,22.83775],[-105.53393,22.83441],[-105.53264,22.83211],[-105.53408,22.83063],[-105.53007,22.82812],[-105.52893,22.82531],[-105.52283,22.81866],[-105.5128,22.81622],[-105.5108,22.81675],[-105.5096,22.81838],[-105.50599,22.81595],[-105.50087,22.81611],[-105.49494,22.81062],[-105.49891,22.81114],[-105.50049,22.80942],[-105.50209,22.81011],[-105.50279,22.80632],[-105.50561,22.80588],[-105.50629,22.80416],[-105.50521,22.80308],[-105.50646,22.79775],[-105.50821,22.79811],[-105.51118,22.79691],[-105.51131,22.79404],[-105.50898,22.7944],[-105.50916,22.79223],[-105.51144,22.79091],[-105.51159,22.78906],[-105.51499,22.78788],[-105.51495,22.78572],[-105.51912,22.78389],[-105.51651,22.78056],[-105.51924,22.77603],[-105.51991,22.77277],[-105.52117,22.77268],[-105.52258,22.77557],[-105.52469,22.77517],[-105.52319,22.77308],[-105.51937,22.759],[-105.51408,22.75933],[-105.51526,22.73947],[-105.52289,22.72433],[-105.51151,22.68525],[-105.49806,22.65139],[-105.46396,22.65924],[-105.46056,22.65123],[-105.46039,22.64755],[-105.46486,22.64611],[-105.47021,22.64014],[-105.47157,22.63604],[-105.4742,22.63281],[-105.47268,22.62719],[-105.47149,22.62564],[-105.46872,22.62508],[-105.45046,22.62676],[-105.44811,22.61012],[-105.45158,22.60832],[-105.45443,22.60521],[-105.45599,22.59874],[-105.45237,22.59532],[-105.44232,22.59036],[-105.43906,22.58789],[-105.4376,22.58491],[-105.43693,22.58191],[-105.43801,22.5777],[-105.43751,22.57085],[-105.43873,22.56524],[-105.43528,22.5597],[-105.43765,22.55574],[-105.43463,22.54998],[-105.43682,22.54074],[-105.43629,22.53832],[-105.44008,22.53171],[-105.44403,22.53001],[-105.44398,22.52873],[-105.44144,22.52595],[-105.44172,22.52427],[-105.44492,22.52158],[-105.45448,22.51876],[-105.46084,22.50857],[-105.46237,22.51074],[-105.46321,22.51061],[-105.46645,22.50539],[-105.47105,22.50556],[-105.47406,22.5029],[-105.47485,22.50546],[-105.47835,22.50498],[-105.47933,22.50784],[-105.4816,22.50877],[-105.4807,22.50995],[-105.48066,22.51393],[-105.4838,22.51771],[-105.49202,22.51945],[-105.49318,22.52028],[-105.4932,22.52342],[-105.49509,22.5231],[-105.50206,22.52514],[-105.50318,22.52768],[-105.50957,22.51696],[-105.51317,22.51702],[-105.51342,22.51848],[-105.51582,22.51803],[-105.51729,22.52018],[-105.52194,22.521],[-105.52937,22.51891],[-105.52958,22.51596],[-105.5336,22.51503],[-105.53837,22.5304],[-105.54004,22.53133],[-105.53993,22.53559],[-105.55252,22.53913],[-105.56038,22.5373],[-105.57364,22.53925],[-105.57619,22.53802],[-105.57595,22.53515],[-105.58389,22.53348],[-105.58991,22.53377],[-105.59258,22.53624],[-105.59829,22.53667],[-105.60166,22.54219],[-105.59991,22.5444],[-105.60048,22.55889],[-105.60535,22.56117],[-105.6063,22.56401],[-105.61211,22.56816],[-105.61767,22.56824],[-105.62204,22.57143],[-105.63141,22.58875],[-105.63095,22.59298],[-105.64216,22.59389],[-105.64244,22.59016],[-105.64317,22.59007],[-105.6427,22.58555],[-105.64099,22.5795],[-105.63921,22.57698],[-105.65402,22.58075],[-105.65488,22.58355],[-105.65732,22.58353],[-105.66056,22.58636],[-105.66139,22.58496],[-105.66428,22.58483],[-105.66679,22.57956],[-105.67105,22.57634],[-105.67416,22.57576],[-105.6764,22.57679],[-105.68175,22.57219],[-105.68748,22.57189],[-105.69005,22.56839],[-105.69883,22.56788],[-105.70048,22.56192],[-105.70013,22.55703],[-105.69304,22.54517],[-105.69173,22.54054],[-105.67715,22.51293],[-105.67523,22.5072],[-105.67431,22.49646],[-105.67111,22.48156],[-105.67265,22.47409],[-105.67704,22.46814],[-105.69248,22.46718],[-105.69509,22.46822],[-105.70055,22.46758],[-105.70474,22.46929],[-105.71412,22.47495],[-105.72702,22.49102],[-105.73978,22.52015],[-105.75021,22.53934],[-105.75294,22.54086],[-105.75609,22.53785],[-105.7583,22.53768],[-105.75759,22.54146],[-105.76022,22.55008],[-105.76261,22.5506],[-105.7716,22.57293],[-105.78624,22.60095],[-105.8088,22.63657],[-105.83516,22.67036],[-105.85973,22.69746],[-105.91792,22.75243],[-105.96401,22.7906],[-105.998,22.81311],[-105.98873,22.82296],[-105.99003,22.82396],[-105.9892,22.82494],[-105.98584,22.82576],[-105.97786,22.82287],[-105.97314,22.82283],[-105.94682,22.84616],[-105.94503,22.84638],[-105.9419,22.85098],[-105.93959,22.84953],[-105.93956,22.84573],[-105.93713,22.84084],[-105.93432,22.84004],[-105.92523,22.84648],[-105.9232,22.84674],[-105.92118,22.84541],[-105.91889,22.8459],[-105.91379,22.85027],[-105.91051,22.84975],[-105.90803,22.85182],[-105.89011,22.84764],[-105.89059,22.8459],[-105.8879,22.84264],[-105.88331,22.84106],[-105.88133,22.84348],[-105.87833,22.83807],[-105.87729,22.83809],[-105.87766,22.8394],[-105.87373,22.84222],[-105.87262,22.8417],[-105.87071,22.84417],[-105.87056,22.84204],[-105.8727,22.83898],[-105.87678,22.83831],[-105.87764,22.83674],[-105.87455,22.83126],[-105.86935,22.83068],[-105.86554,22.82722],[-105.86112,22.82651],[-105.85543,22.82864],[-105.85674,22.832],[-105.85412,22.83352],[-105.85395,22.82986],[-105.8506,22.82562],[-105.84846,22.8247],[-105.84497,22.8248],[-105.839,22.82784],[-105.836,22.83199],[-105.83447,22.831],[-105.83329,22.8373],[-105.83132,22.83378],[-105.82575,22.83638],[-105.82311,22.83547],[-105.81656,22.836],[-105.83109,22.85039],[-105.85622,22.88457],[-105.83997,22.88742],[-105.83837,22.88408],[-105.83609,22.8878],[-105.83526,22.89197],[-105.83005,22.89176],[-105.82518,22.89355],[-105.82476,22.90479],[-105.8264,22.90957],[-105.81777,22.91512],[-105.81827,22.92086],[-105.81569,22.91866],[-105.81444,22.92111],[-105.81572,22.92392],[-105.8149,22.92813],[-105.81164,22.92476],[-105.80868,22.92577],[-105.80403,22.93958],[-105.78878,22.94485],[-105.75978,22.96247],[-105.75239,22.9605]]]}},{"type":"Feature","properties":{"name":"El Fuerte","cvegeo":"25010"},"geometry":{"type":"Polygon","coordinates":[[[-108.64411,26.65274],[-108.63315,26.64979],[-108.6312,26.6506],[-108.62222,26.64924],[-108.61795,26.64456],[-108.61895,26.64207],[-108.61798,26.64077],[-108.61854,26.63972],[-108.62284,26.63849],[-108.6305,26.63932],[-108.6306,26.6358],[-108.63168,26.63486],[-108.63105,26.63312],[-108.6379,26.62978],[-108.63581,26.62667],[-108.63348,26.62689],[-108.63107,26.62348],[-108.62722,26.62132],[-108.63088,26.61943],[-108.6311,26.6161],[-108.63388,26.61381],[-108.63494,26.61029],[-108.6342,26.60889],[-108.62473,26.60661],[-108.61964,26.60323],[-108.61893,26.6041],[-108.61812,26.599],[-108.6197,26.59695],[-108.61722,26.59418],[-108.61481,26.59481],[-108.61508,26.59948],[-108.61153,26.59752],[-108.61289,26.59355],[-108.61867,26.59159],[-108.61738,26.58928],[-108.61508,26.59115],[-108.61469,26.58927],[-108.6084,26.58661],[-108.60943,26.58541],[-108.60708,26.58425],[-108.60587,26.58519],[-108.60137,26.58381],[-108.60218,26.58195],[-108.60062,26.58042],[-108.60247,26.57807],[-108.60093,26.57477],[-108.60134,26.57316],[-108.60292,26.56923],[-108.60533,26.56881],[-108.60286,26.56728],[-108.59535,26.57045],[-108.59475,26.56818],[-108.59813,26.5664],[-108.59553,26.56641],[-108.5921,26.56183],[-108.58951,26.56274],[-108.5868,26.55925],[-108.58597,26.56092],[-108.58806,26.56327],[-108.58752,26.56419],[-108.5861,26.56299],[-108.58371,26.56326],[-108.58127,26.55955],[-108.57522,26.55941],[-108.57514,26.56065],[-108.57391,26.56106],[-108.57028,26.55966],[-108.52977,26.57711],[-108.52969,26.58398],[-108.5195,26.58079],[-108.52134,26.58419],[-108.5205,26.58696],[-108.52263,26.59085],[-108.52148,26.59176],[-108.52277,26.59708],[-108.51941,26.60078],[-108.5206,26.60466],[-108.52249,26.60415],[-108.52374,26.60525],[-108.52375,26.6076],[-108.52267,26.60819],[-108.52323,26.60994],[-108.52721,26.61232],[-108.53064,26.61177],[-108.53377,26.61291],[-108.53669,26.6111],[-108.53185,26.62102],[-108.53375,26.6239],[-108.52861,26.62787],[-108.52379,26.62948],[-108.52035,26.62645],[-108.51879,26.62297],[-108.51924,26.62062],[-108.52151,26.61813],[-108.5208,26.61668],[-108.52241,26.61609],[-108.52201,26.61474],[-108.52507,26.6129],[-108.52229,26.61062],[-108.52077,26.61205],[-108.52112,26.61335],[-108.51923,26.61448],[-108.51846,26.61223],[-108.52118,26.61023],[-108.51836,26.60622],[-108.51639,26.60787],[-108.51536,26.60605],[-108.5138,26.60611],[-108.51166,26.6036],[-108.51073,26.60462],[-108.50829,26.60312],[-108.50525,26.60298],[-108.50612,26.60628],[-108.50823,26.60739],[-108.50838,26.61078],[-108.50427,26.60866],[-108.5014,26.60997],[-108.49148,26.60096],[-108.47263,26.59907],[-108.46929,26.60312],[-108.46758,26.6029],[-108.46915,26.6108],[-108.44656,26.61665],[-108.44643,26.62074],[-108.44169,26.62548],[-108.4398,26.63165],[-108.43488,26.63671],[-108.43549,26.64452],[-108.40354,26.64359],[-108.38787,26.61777],[-108.38592,26.61631],[-108.39109,26.61454],[-108.40309,26.59864],[-108.4053,26.59714],[-108.40951,26.60195],[-108.41187,26.60162],[-108.41789,26.59728],[-108.41864,26.59226],[-108.42709,26.58593],[-108.43973,26.58632],[-108.43122,26.56969],[-108.43729,26.56307],[-108.44219,26.55314],[-108.44771,26.55191],[-108.45612,26.54807],[-108.45739,26.54371],[-108.46493,26.53763],[-108.4603,26.5365],[-108.45649,26.53419],[-108.45331,26.53523],[-108.4509,26.53387],[-108.44879,26.536],[-108.44538,26.53468],[-108.43921,26.53691],[-108.43625,26.5335],[-108.43457,26.53427],[-108.42857,26.53254],[-108.4245,26.53346],[-108.42168,26.52907],[-108.42124,26.52329],[-108.42256,26.52183],[-108.4193,26.52073],[-108.41766,26.51696],[-108.41844,26.51194],[-108.41424,26.51],[-108.40888,26.51052],[-108.40628,26.50729],[-108.40401,26.50668],[-108.39244,26.48362],[-108.3862,26.4916],[-108.37436,26.47572],[-108.37222,26.47711],[-108.36648,26.47814],[-108.36508,26.49084],[-108.36101,26.48966],[-108.35584,26.47809],[-108.33838,26.47831],[-108.33721,26.48723],[-108.32669,26.49097],[-108.32493,26.49002],[-108.31956,26.48999],[-108.31514,26.48726],[-108.31368,26.48046],[-108.30496,26.47189],[-108.29716,26.45226],[-108.26051,26.45659],[-108.28823,26.44241],[-108.31029,26.44066],[-108.30784,26.42459],[-108.30433,26.41262],[-108.30471,26.40375],[-108.30104,26.37373],[-108.28624,26.37095],[-108.27221,26.36639],[-108.28457,26.34286],[-108.27906,26.3234],[-108.28095,26.30886],[-108.28511,26.3077],[-108.28601,26.29505],[-108.28266,26.29777],[-108.2819,26.29247],[-108.27968,26.29156],[-108.27321,26.27801],[-108.2774,26.27593],[-108.28175,26.26935],[-108.28256,26.26636],[-108.28534,26.26416],[-108.27559,26.24809],[-108.3199,26.22221],[-108.35772,26.21889],[-108.35439,26.20281],[-108.38128,26.16232],[-108.39777,26.16587],[-108.40407,26.15611],[-108.4153,26.14502],[-108.40821,26.13113],[-108.41521,26.11704],[-108.43046,26.11625],[-108.4437,26.12396],[-108.43953,26.1322],[-108.44776,26.14446],[-108.45261,26.14134],[-108.45535,26.15044],[-108.46548,26.15625],[-108.47765,26.12919],[-108.48484,26.14258],[-108.48778,26.13904],[-108.49236,26.14607],[-108.49776,26.14829],[-108.50349,26.14709],[-108.50434,26.14258],[-108.49743,26.11582],[-108.51348,26.11377],[-108.51582,26.0989],[-108.5859,26.10588],[-108.61432,26.10628],[-108.61702,26.10038],[-108.59979,26.0847],[-108.61601,26.05591],[-108.62859,26.02999],[-108.63179,26.03434],[-108.63298,26.02069],[-108.64512,25.99104],[-108.64785,25.97581],[-108.61395,25.97524],[-108.61503,25.92701],[-108.65712,25.91777],[-108.66431,25.89459],[-108.64991,25.88063],[-108.67091,25.87322],[-108.66747,25.85079],[-108.70494,25.84623],[-108.70661,25.84832],[-108.72489,25.85026],[-108.72428,25.86123],[-108.73042,25.86319],[-108.73841,25.85493],[-108.74033,25.85655],[-108.76481,25.85083],[-108.7699,25.86871],[-108.77057,25.86951],[-108.77716,25.86822],[-108.77827,25.87227],[-108.78524,25.86895],[-108.79147,25.86754],[-108.79315,25.86452],[-108.85369,25.83931],[-108.85908,25.81665],[-108.86302,25.81992],[-108.86664,25.82033],[-108.85462,25.84013],[-108.89852,25.87785],[-108.89551,25.88295],[-108.91512,25.89415],[-108.91889,25.88852],[-108.91721,25.88509],[-108.92322,25.87416],[-108.92243,25.87262],[-108.90644,25.86659],[-108.91117,25.85857],[-108.91459,25.8624],[-108.9403,25.87682],[-108.94301,25.87303],[-108.95105,25.87752],[-108.96146,25.85001],[-108.96626,25.85547],[-108.96444,25.85823],[-108.98032,25.86755],[-108.97631,25.87355],[-108.98395,25.91839],[-108.98171,25.9192],[-108.9822,25.92028],[-108.97631,25.92204],[-108.97389,25.92636],[-108.98106,25.93017],[-108.99246,25.93123],[-108.99974,25.93695],[-109.00115,25.93962],[-109.00807,25.94327],[-109.00952,25.94577],[-109.00942,25.94703],[-109.00631,25.94807],[-109.00558,25.95261],[-108.99842,25.96411],[-108.99589,25.96422],[-108.99461,25.97057],[-108.99602,25.97135],[-108.98815,25.97328],[-108.99649,25.99647],[-108.98782,26.00461],[-109.01786,26.03467],[-108.95811,26.09383],[-108.97323,26.10265],[-108.96925,26.10517],[-108.96481,26.11219],[-108.96628,26.11245],[-108.97231,26.10906],[-108.97845,26.11434],[-108.98262,26.11534],[-108.98524,26.11831],[-108.98525,26.12051],[-108.98702,26.12355],[-108.99972,26.12762],[-109.00245,26.13292],[-109.01638,26.1361],[-108.99229,26.22117],[-109.00395,26.22391],[-109.00791,26.22579],[-109.0089,26.23053],[-109.0134,26.23201],[-109.01554,26.23433],[-109.03194,26.23785],[-109.04258,26.24743],[-109.03821,26.24655],[-109.0321,26.26793],[-109.02833,26.26689],[-109.02669,26.2723],[-109.02421,26.27175],[-109.02367,26.27377],[-109.02666,26.27509],[-108.99314,26.2932],[-108.96324,26.28621],[-108.95816,26.30414],[-108.95213,26.30551],[-108.95243,26.30206],[-108.94711,26.30577],[-108.95157,26.29011],[-108.94996,26.28961],[-108.93298,26.29721],[-108.9329,26.2989],[-108.9277,26.30215],[-108.92952,26.30696],[-108.93286,26.30668],[-108.93272,26.3177],[-108.93159,26.31667],[-108.93152,26.377],[-108.93261,26.37668],[-108.94308,26.38846],[-108.94984,26.3922],[-108.93652,26.39018],[-108.90918,26.41659],[-108.91012,26.42171],[-108.88139,26.40625],[-108.86034,26.43277],[-108.87611,26.44758],[-108.8491,26.46722],[-108.83776,26.47252],[-108.8378,26.47686],[-108.84748,26.48722],[-108.85065,26.48636],[-108.85674,26.48052],[-108.91467,26.47954],[-108.89132,26.4896],[-108.87315,26.55107],[-108.80642,26.5706],[-108.80388,26.57056],[-108.79722,26.56784],[-108.79551,26.56563],[-108.78772,26.56526],[-108.78418,26.56881],[-108.77709,26.57093],[-108.77782,26.57269],[-108.77644,26.5735],[-108.77659,26.58011],[-108.73429,26.59357],[-108.71074,26.59363],[-108.71059,26.58706],[-108.67883,26.58702],[-108.67899,26.64289],[-108.66726,26.6526],[-108.66364,26.658],[-108.65537,26.65577],[-108.64411,26.65274]]]}},{"type":"Feature","properties":{"name":"Guasave","cvegeo":"25011"},"geometry":{"type":"Polygon","coordinates":[[[-108.75784,25.8308],[-108.74702,25.8107],[-108.737,25.80016],[-108.73185,25.79162],[-108.72047,25.79152],[-108.72049,25.78541],[-108.71581,25.78829],[-108.71342,25.78851],[-108.70511,25.78406],[-108.70449,25.7819],[-108.70662,25.76996],[-108.7064,25.74215],[-108.70555,25.73925],[-108.70089,25.73431],[-108.68666,25.72686],[-108.69108,25.72007],[-108.68249,25.71554],[-108.68931,25.70513],[-108.67504,25.69786],[-108.66325,25.70756],[-108.65503,25.70056],[-108.65509,25.70575],[-108.56268,25.70539],[-108.56239,25.7094],[-108.55771,25.70913],[-108.55714,25.71189],[-108.55029,25.70976],[-108.5508,25.72134],[-108.54022,25.72149],[-108.54059,25.72991],[-108.53002,25.73024],[-108.53039,25.73989],[-108.49161,25.73292],[-108.49146,25.7425],[-108.48295,25.74364],[-108.48313,25.74206],[-108.47557,25.74236],[-108.47516,25.73605],[-108.45789,25.7368],[-108.45571,25.74325],[-108.44682,25.74361],[-108.43728,25.79059],[-108.42942,25.78668],[-108.42793,25.78702],[-108.41868,25.78342],[-108.41835,25.76844],[-108.39162,25.76768],[-108.36649,25.76437],[-108.36403,25.73571],[-108.36461,25.73357],[-108.36072,25.73487],[-108.35885,25.73936],[-108.35984,25.74003],[-108.35837,25.7412],[-108.35958,25.7422],[-108.35289,25.74842],[-108.35212,25.74798],[-108.34956,25.75017],[-108.34773,25.75482],[-108.34576,25.75434],[-108.34673,25.75273],[-108.34614,25.74942],[-108.34816,25.74765],[-108.34803,25.74388],[-108.34435,25.74142],[-108.34198,25.74244],[-108.3395,25.74593],[-108.33778,25.75147],[-108.33617,25.75075],[-108.33559,25.75317],[-108.33693,25.75635],[-108.33472,25.75727],[-108.32868,25.75213],[-108.32983,25.75033],[-108.31593,25.73835],[-108.31201,25.73747],[-108.30555,25.73191],[-108.29196,25.71706],[-108.29946,25.71135],[-108.2944,25.69751],[-108.29874,25.69833],[-108.30494,25.6931],[-108.3117,25.69969],[-108.31359,25.69801],[-108.31273,25.69599],[-108.31364,25.69545],[-108.31201,25.69379],[-108.3119,25.68276],[-108.30967,25.68431],[-108.30687,25.68189],[-108.30743,25.67929],[-108.30183,25.67613],[-108.30382,25.67299],[-108.30649,25.67442],[-108.30981,25.67012],[-108.29768,25.6643],[-108.29845,25.66049],[-108.26215,25.65381],[-108.25121,25.64376],[-108.22065,25.63894],[-108.2194,25.63794],[-108.19434,25.63328],[-108.17864,25.61612],[-108.18053,25.61368],[-108.18495,25.61173],[-108.18523,25.60972],[-108.18811,25.60666],[-108.19042,25.60693],[-108.20794,25.59202],[-108.2135,25.5897],[-108.1895,25.55059],[-108.19075,25.53685],[-108.19634,25.5338],[-108.19558,25.53044],[-108.20183,25.52613],[-108.20446,25.51398],[-108.19679,25.51094],[-108.18918,25.48653],[-108.19309,25.48255],[-108.22016,25.49053],[-108.25263,25.48676],[-108.25268,25.48504],[-108.25717,25.48181],[-108.25957,25.47849],[-108.26251,25.47822],[-108.26656,25.47512],[-108.27169,25.47428],[-108.27442,25.47271],[-108.27677,25.4708],[-108.27976,25.45704],[-108.28043,25.45376],[-108.27926,25.45351],[-108.29032,25.39596],[-108.30271,25.39914],[-108.30496,25.39357],[-108.30707,25.39345],[-108.307,25.36651],[-108.31452,25.36657],[-108.31453,25.36965],[-108.32,25.36803],[-108.31891,25.36995],[-108.32075,25.37074],[-108.32416,25.36698],[-108.32913,25.36609],[-108.33767,25.36196],[-108.33978,25.36301],[-108.34075,25.36736],[-108.34422,25.36892],[-108.346,25.3628],[-108.35204,25.35753],[-108.36005,25.35672],[-108.36245,25.3584],[-108.36788,25.35653],[-108.3632,25.34513],[-108.36665,25.33791],[-108.365,25.33627],[-108.37294,25.33282],[-108.37393,25.3168],[-108.37228,25.31496],[-108.37242,25.31288],[-108.37038,25.31244],[-108.3716,25.31073],[-108.37423,25.3105],[-108.37745,25.30791],[-108.37891,25.29696],[-108.37338,25.29149],[-108.37264,25.28617],[-108.37143,25.28342],[-108.36977,25.28229],[-108.36725,25.28269],[-108.36603,25.28546],[-108.36197,25.28482],[-108.36091,25.28547],[-108.36119,25.28791],[-108.36017,25.28876],[-108.35891,25.28824],[-108.35679,25.28356],[-108.35765,25.28012],[-108.35688,25.27379],[-108.35751,25.27056],[-108.36029,25.2677],[-108.37012,25.26214],[-108.37203,25.25978],[-108.37147,25.24655],[-108.38162,25.24055],[-108.38416,25.24052],[-108.38473,25.23945],[-108.3821,25.23494],[-108.38212,25.23378],[-108.38413,25.23365],[-108.3843,25.22977],[-108.38325,25.22809],[-108.37497,25.22331],[-108.37221,25.21824],[-108.37551,25.20044],[-108.38026,25.19515],[-108.3809,25.1911],[-108.38367,25.18666],[-108.38462,25.1873],[-108.38704,25.1853],[-108.39059,25.19033],[-108.39589,25.19274],[-108.39885,25.20041],[-108.40378,25.20691],[-108.43508,25.2436],[-108.45028,25.2566],[-108.4729,25.27099],[-108.49484,25.28067],[-108.49567,25.28257],[-108.5348,25.29909],[-108.56391,25.31275],[-108.62964,25.3369],[-108.65211,25.34417],[-108.68985,25.35456],[-108.74566,25.36463],[-108.75121,25.36851],[-108.79807,25.36962],[-108.80006,25.36869],[-108.81168,25.37629],[-108.8683,25.4047],[-108.9112,25.4206],[-108.93703,25.42694],[-108.96272,25.43175],[-108.9855,25.4351],[-109.02044,25.43773],[-109.02647,25.44135],[-109.02655,25.44438],[-109.02223,25.44572],[-108.90731,25.44751],[-108.89646,25.48019],[-108.88658,25.49567],[-108.88438,25.50874],[-108.89193,25.51302],[-108.86122,25.5698],[-108.86009,25.5734],[-108.85811,25.57672],[-108.85243,25.58165],[-108.85435,25.59119],[-108.8521,25.59161],[-108.84769,25.58852],[-108.84915,25.5815],[-108.8416,25.57976],[-108.84599,25.58586],[-108.84162,25.58779],[-108.84513,25.59634],[-108.85456,25.61064],[-108.85887,25.62267],[-108.86318,25.62299],[-108.86438,25.64005],[-108.86364,25.64355],[-108.86834,25.71091],[-108.87017,25.71052],[-108.86975,25.71618],[-108.863,25.72911],[-108.85381,25.73916],[-108.8644,25.74035],[-108.85272,25.75109],[-108.84001,25.75225],[-108.84025,25.75326],[-108.83199,25.76539],[-108.82936,25.76398],[-108.82678,25.76797],[-108.83243,25.77089],[-108.83056,25.77338],[-108.83281,25.77403],[-108.83002,25.77453],[-108.82955,25.77759],[-108.82457,25.7855],[-108.81989,25.78771],[-108.81597,25.7923],[-108.81493,25.79161],[-108.81388,25.79447],[-108.8111,25.79748],[-108.80946,25.79645],[-108.80751,25.79963],[-108.79435,25.79257],[-108.77953,25.81548],[-108.77764,25.81571],[-108.77491,25.81952],[-108.77216,25.81805],[-108.76607,25.82656],[-108.76191,25.82682],[-108.75788,25.83087],[-108.75784,25.8308]]]}},{"type":"Feature","properties":{"name":"Mazatlán","cvegeo":"25012"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-106.41293,23.17304],[-106.41301,23.17303],[-106.41311,23.17304],[-106.41293,23.17304]]],[[[-106.40392,23.18031],[-106.40296,23.17978],[-106.40409,23.17845],[-106.40416,23.18032],[-106.40392,23.18031]]],[[[-106.44012,23.18523],[-106.4393,23.18438],[-106.44079,23.18384],[-106.44014,23.1852],[-106.44012,23.18523]]],[[[-106.43618,23.18684],[-106.43666,23.18775],[-106.43615,23.18692],[-106.43618,23.18684]]],[[[-106.46542,23.2231],[-106.46722,23.22232],[-106.46355,23.22772],[-106.463,23.22524],[-106.46515,23.22334],[-106.46542,23.2231]]],[[[-106.46233,23.23081],[-106.46373,23.22783],[-106.46511,23.23024],[-106.46663,23.23045],[-106.46558,23.23151],[-106.47034,23.23299],[-106.47126,23.23488],[-106.46945,23.23747],[-106.4666,23.23908],[-106.46338,23.23604],[-106.46395,23.2354],[-106.46253,23.2316],[-106.46233,23.23081]]],[[[-106.47518,23.25843],[-106.47277,23.256],[-106.47421,23.25231],[-106.47356,23.25155],[-106.4795,23.25036],[-106.47939,23.25666],[-106.47528,23.25852],[-106.47518,23.25843]]],[[[-105.95188,23.81965],[-105.93933,23.79143],[-105.93217,23.7947],[-105.93124,23.79058],[-105.92878,23.78658],[-105.92833,23.78285],[-105.92953,23.78096],[-105.92494,23.77382],[-105.92581,23.76924],[-105.92937,23.76658],[-105.92667,23.76152],[-105.92719,23.7605],[-105.92936,23.75943],[-105.93009,23.75695],[-105.93164,23.75578],[-105.93316,23.75589],[-105.93779,23.7596],[-105.94287,23.76126],[-105.94774,23.75838],[-105.9567,23.75716],[-105.95884,23.75771],[-105.9612,23.76094],[-105.96749,23.76599],[-105.97513,23.7663],[-105.97675,23.765],[-105.97766,23.76049],[-105.982,23.75929],[-105.98532,23.7569],[-105.98647,23.75136],[-105.98915,23.74756],[-105.99136,23.74639],[-105.99607,23.74742],[-106.00015,23.75103],[-106.00618,23.74988],[-106.0115,23.7473],[-106.01329,23.74482],[-106.01232,23.74128],[-106.00597,23.7355],[-106.00533,23.73204],[-106.00745,23.72496],[-106.00513,23.71888],[-106.00875,23.71713],[-106.01305,23.71284],[-106.01623,23.71354],[-106.01744,23.71612],[-106.01991,23.71637],[-106.02449,23.71403],[-106.02633,23.71192],[-106.02504,23.70783],[-106.022,23.70409],[-106.01434,23.70093],[-106.01641,23.69586],[-106.02211,23.69075],[-106.02048,23.68676],[-106.02087,23.68197],[-106.02395,23.67743],[-106.02903,23.67871],[-106.03236,23.68127],[-106.03461,23.68118],[-106.04204,23.67926],[-106.04418,23.67596],[-106.04272,23.67207],[-106.03763,23.67262],[-106.03505,23.67043],[-106.03409,23.66436],[-106.0386,23.66209],[-106.03951,23.65971],[-106.03794,23.65672],[-106.03376,23.65658],[-106.03334,23.65374],[-106.03673,23.65219],[-106.042,23.65569],[-106.04525,23.65374],[-106.04974,23.64873],[-106.057,23.65333],[-106.06295,23.65308],[-106.06456,23.64881],[-106.06915,23.64355],[-106.0689,23.64146],[-106.06448,23.63982],[-106.06161,23.63565],[-106.06193,23.63276],[-106.06523,23.63174],[-106.06752,23.62699],[-106.06478,23.62112],[-106.06062,23.61578],[-106.06163,23.61287],[-106.06348,23.61141],[-106.06615,23.61119],[-106.07261,23.61623],[-106.07505,23.61663],[-106.07708,23.61598],[-106.07901,23.61306],[-106.08099,23.61304],[-106.08701,23.61535],[-106.08995,23.62153],[-106.09232,23.62295],[-106.09447,23.61811],[-106.0921,23.61399],[-106.0851,23.60737],[-106.08514,23.60433],[-106.08868,23.60385],[-106.09375,23.59848],[-106.10033,23.59828],[-106.10748,23.60224],[-106.10857,23.60196],[-106.10878,23.60064],[-106.11093,23.60005],[-106.11238,23.5954],[-106.11058,23.59232],[-106.11255,23.58549],[-106.11129,23.5838],[-106.10567,23.58272],[-106.10459,23.57846],[-106.10994,23.5759],[-106.11414,23.57221],[-106.1164,23.56792],[-106.11926,23.56721],[-106.12123,23.5681],[-106.12081,23.57452],[-106.12276,23.57617],[-106.13269,23.58006],[-106.14861,23.58374],[-106.15219,23.58175],[-106.15266,23.57755],[-106.15461,23.57371],[-106.14841,23.56683],[-106.14382,23.56362],[-106.15005,23.5554],[-106.15284,23.55515],[-106.15649,23.55786],[-106.1641,23.5594],[-106.16771,23.56446],[-106.17428,23.56637],[-106.18068,23.56083],[-106.17986,23.55681],[-106.18075,23.5549],[-106.18396,23.55338],[-106.19106,23.55258],[-106.19302,23.5487],[-106.19283,23.54642],[-106.19124,23.54216],[-106.18657,23.53946],[-106.18539,23.53743],[-106.1839,23.52601],[-106.18444,23.52535],[-106.18637,23.52605],[-106.19084,23.51927],[-106.19527,23.51793],[-106.19838,23.51385],[-106.19694,23.5046],[-106.19971,23.50015],[-106.19926,23.49774],[-106.20013,23.49582],[-106.19923,23.49367],[-106.19955,23.48894],[-106.19731,23.48437],[-106.19808,23.4836],[-106.20415,23.48375],[-106.20568,23.48201],[-106.20496,23.47734],[-106.20107,23.47475],[-106.2007,23.47006],[-106.20334,23.4685],[-106.20743,23.47036],[-106.21171,23.46958],[-106.21222,23.46586],[-106.20812,23.4618],[-106.21078,23.45377],[-106.21675,23.45114],[-106.22206,23.45195],[-106.22687,23.45095],[-106.23142,23.4522],[-106.23364,23.45098],[-106.23695,23.44627],[-106.23356,23.43791],[-106.21716,23.43278],[-106.21155,23.42217],[-106.21121,23.41507],[-106.20895,23.41233],[-106.20675,23.40497],[-106.21172,23.40003],[-106.22158,23.39888],[-106.22242,23.39707],[-106.22095,23.39455],[-106.21849,23.3932],[-106.21059,23.38512],[-106.21134,23.37891],[-106.20868,23.3725],[-106.20968,23.37082],[-106.22941,23.3705],[-106.2352,23.36813],[-106.2369,23.36535],[-106.23189,23.3626],[-106.22911,23.35946],[-106.22909,23.35768],[-106.23872,23.35632],[-106.2429,23.35208],[-106.23217,23.35382],[-106.23193,23.34719],[-106.22671,23.34425],[-106.22614,23.3428],[-106.22173,23.34423],[-106.22001,23.33964],[-106.22125,23.33793],[-106.21993,23.33618],[-106.22037,23.3345],[-106.21744,23.33269],[-106.21411,23.33411],[-106.21132,23.3307],[-106.20929,23.32993],[-106.20366,23.32989],[-106.2001,23.32833],[-106.19825,23.32918],[-106.19472,23.32746],[-106.18961,23.32667],[-106.18566,23.3272],[-106.18508,23.31045],[-106.1746,23.30393],[-106.15946,23.21381],[-106.18511,23.21313],[-106.18613,23.20753],[-106.18875,23.20798],[-106.19183,23.20651],[-106.19486,23.20659],[-106.20558,23.19961],[-106.19999,23.1988],[-106.19941,23.19773],[-106.20074,23.19068],[-106.19579,23.19156],[-106.19613,23.18961],[-106.14707,23.19027],[-106.13633,23.18258],[-106.13981,23.18299],[-106.13917,23.17614],[-106.13428,23.1664],[-106.12717,23.16562],[-106.12343,23.16265],[-106.12099,23.16426],[-106.12127,23.16169],[-106.1204,23.16105],[-106.11632,23.16065],[-106.11435,23.16191],[-106.11174,23.16106],[-106.10851,23.16246],[-106.10775,23.16115],[-106.10592,23.16132],[-106.10551,23.15983],[-106.10409,23.15991],[-106.10318,23.16153],[-106.0998,23.16017],[-106.10102,23.15883],[-106.09561,23.15531],[-106.09902,23.15168],[-106.09875,23.14973],[-106.10264,23.1479],[-106.10408,23.14479],[-106.10679,23.14299],[-106.10649,23.14019],[-106.10815,23.1361],[-106.11989,23.11471],[-106.14035,23.08537],[-106.1406,23.08713],[-106.14583,23.08786],[-106.14739,23.08693],[-106.14996,23.08751],[-106.15069,23.0866],[-106.16658,23.09955],[-106.17735,23.11288],[-106.18237,23.10921],[-106.18391,23.11037],[-106.18271,23.11128],[-106.18315,23.11224],[-106.18625,23.11203],[-106.18563,23.11373],[-106.18783,23.11552],[-106.18948,23.11502],[-106.18938,23.121],[-106.19168,23.12059],[-106.19138,23.11883],[-106.19334,23.11725],[-106.19407,23.11499],[-106.1924,23.11243],[-106.19284,23.11053],[-106.19112,23.10954],[-106.19149,23.10699],[-106.18894,23.10739],[-106.18954,23.1065],[-106.18845,23.10568],[-106.1884,23.10368],[-106.20396,23.09085],[-106.22051,23.09534],[-106.22316,23.08228],[-106.22779,23.08142],[-106.22924,23.09079],[-106.23529,23.09351],[-106.24495,23.09182],[-106.25221,23.09579],[-106.25923,23.08938],[-106.24815,23.08023],[-106.25789,23.06844],[-106.2922,23.09269],[-106.3137,23.1158],[-106.33079,23.13154],[-106.39059,23.18065],[-106.39739,23.18422],[-106.40849,23.1873],[-106.41177,23.18635],[-106.41365,23.1817],[-106.41233,23.18228],[-106.4117,23.18056],[-106.41421,23.178],[-106.41581,23.17899],[-106.41894,23.17778],[-106.41842,23.1785],[-106.42036,23.17945],[-106.42408,23.17955],[-106.42572,23.17646],[-106.42546,23.17706],[-106.42844,23.17589],[-106.42999,23.17658],[-106.43003,23.17776],[-106.42823,23.1786],[-106.42678,23.18178],[-106.42685,23.18398],[-106.42502,23.18452],[-106.42462,23.18599],[-106.42526,23.18763],[-106.42721,23.18782],[-106.42831,23.18951],[-106.42767,23.19146],[-106.42858,23.1931],[-106.42667,23.19599],[-106.42781,23.19849],[-106.43024,23.19963],[-106.43063,23.2034],[-106.42864,23.20558],[-106.42917,23.2083],[-106.42632,23.20961],[-106.42597,23.20787],[-106.42498,23.20769],[-106.42269,23.20958],[-106.42145,23.21396],[-106.42205,23.21676],[-106.42577,23.22356],[-106.43622,23.23288],[-106.44315,23.23714],[-106.44644,23.23776],[-106.44852,23.23984],[-106.45324,23.24149],[-106.45732,23.25216],[-106.4623,23.25765],[-106.46404,23.25805],[-106.4665,23.26061],[-106.46684,23.26539],[-106.46863,23.267],[-106.46796,23.26719],[-106.46851,23.26923],[-106.4662,23.2699],[-106.46625,23.27162],[-106.47201,23.28337],[-106.49067,23.3034],[-106.49353,23.30367],[-106.49416,23.30557],[-106.49314,23.30801],[-106.49114,23.30849],[-106.4891,23.3074],[-106.48421,23.30854],[-106.48071,23.31346],[-106.47972,23.31726],[-106.4802,23.3232],[-106.48358,23.33127],[-106.49033,23.33845],[-106.49494,23.34653],[-106.50238,23.35408],[-106.5042,23.3589],[-106.51255,23.36839],[-106.52391,23.38508],[-106.5371,23.4004],[-106.5594,23.42211],[-106.5792,23.4391],[-106.59361,23.44965],[-106.59774,23.45528],[-106.61837,23.47351],[-106.61479,23.50123],[-106.6045,23.55079],[-106.59742,23.61619],[-106.51873,23.62424],[-106.52579,23.64453],[-106.52933,23.66017],[-106.5266,23.66417],[-106.5296,23.66814],[-106.52119,23.69104],[-106.47729,23.68947],[-106.46672,23.69876],[-106.45209,23.69792],[-106.41655,23.69268],[-106.38596,23.67768],[-106.36914,23.63815],[-106.36638,23.64103],[-106.3622,23.63907],[-106.35878,23.64058],[-106.35659,23.6384],[-106.35344,23.6383],[-106.35165,23.6339],[-106.34766,23.63437],[-106.34505,23.63089],[-106.34191,23.63037],[-106.34085,23.6285],[-106.34148,23.62612],[-106.33671,23.62467],[-106.33195,23.61527],[-106.32962,23.61726],[-106.32366,23.6144],[-106.32055,23.61521],[-106.31736,23.61407],[-106.31492,23.6151],[-106.31381,23.61412],[-106.31065,23.61467],[-106.30809,23.61171],[-106.31049,23.60956],[-106.31032,23.60574],[-106.3094,23.60438],[-106.30642,23.60424],[-106.30391,23.60133],[-106.30272,23.60114],[-106.30017,23.60298],[-106.29843,23.60252],[-106.29592,23.60462],[-106.29456,23.60393],[-106.29435,23.60189],[-106.29133,23.60281],[-106.29012,23.60019],[-106.28586,23.60283],[-106.28426,23.60019],[-106.2829,23.60102],[-106.28072,23.6003],[-106.27764,23.60174],[-106.2788,23.60292],[-106.27579,23.60536],[-106.27174,23.60326],[-106.2728,23.60472],[-106.27216,23.60671],[-106.26952,23.60694],[-106.26666,23.60885],[-106.26706,23.61404],[-106.26426,23.61322],[-106.26668,23.61538],[-106.26525,23.61739],[-106.2652,23.61958],[-106.26259,23.6184],[-106.26039,23.61866],[-106.25948,23.62114],[-106.26142,23.62217],[-106.26039,23.6234],[-106.25582,23.62488],[-106.25269,23.62415],[-106.25413,23.62701],[-106.25416,23.63062],[-106.25161,23.63233],[-106.2518,23.62981],[-106.24938,23.6295],[-106.24896,23.63377],[-106.25019,23.63458],[-106.24638,23.63571],[-106.24806,23.63677],[-106.2467,23.63751],[-106.2471,23.63914],[-106.24423,23.64191],[-106.24264,23.64251],[-106.24151,23.63902],[-106.24232,23.63722],[-106.23943,23.63759],[-106.2384,23.63591],[-106.23669,23.63595],[-106.23586,23.63738],[-106.23614,23.64235],[-106.23445,23.64165],[-106.23441,23.63923],[-106.23155,23.64084],[-106.2324,23.64591],[-106.22804,23.64882],[-106.22931,23.65009],[-106.22723,23.65426],[-106.22328,23.65366],[-106.22071,23.65547],[-106.2202,23.65732],[-106.21768,23.65764],[-106.21239,23.65555],[-106.20914,23.65828],[-106.20881,23.65989],[-106.21107,23.66109],[-106.21211,23.66324],[-106.2084,23.66334],[-106.20762,23.66444],[-106.20952,23.66472],[-106.21012,23.66596],[-106.20744,23.66606],[-106.2092,23.66787],[-106.20631,23.66819],[-106.20431,23.6709],[-106.20515,23.67213],[-106.20756,23.67192],[-106.20433,23.67371],[-106.20615,23.67458],[-106.20566,23.67654],[-106.20333,23.67756],[-106.17921,23.66319],[-106.17314,23.70739],[-106.11543,23.72852],[-106.1597,23.77022],[-106.06833,23.89116],[-105.9763,23.83466],[-105.95188,23.81965]]]]}},{"type":"Feature","properties":{"name":"Mocorito","cvegeo":"25013"},"geometry":{"type":"Polygon","coordinates":[[[-107.64652,25.8123],[-107.65182,25.77109],[-107.6298,25.68291],[-107.58894,25.67952],[-107.57124,25.67955],[-107.5735,25.67327],[-107.57618,25.67288],[-107.57863,25.67003],[-107.58113,25.66893],[-107.57957,25.66542],[-107.58301,25.66646],[-107.58525,25.6652],[-107.58461,25.65933],[-107.58555,25.65575],[-107.58248,25.64931],[-107.57957,25.6488],[-107.57943,25.64521],[-107.57576,25.64155],[-107.57674,25.64051],[-107.58028,25.63998],[-107.58077,25.63795],[-107.58472,25.63607],[-107.58259,25.63327],[-107.58485,25.62964],[-107.58384,25.62676],[-107.58785,25.62473],[-107.5858,25.62202],[-107.58576,25.62028],[-107.59176,25.61779],[-107.58793,25.61651],[-107.58602,25.61344],[-107.58265,25.61189],[-107.57835,25.60729],[-107.57836,25.60637],[-107.58185,25.60481],[-107.58001,25.59941],[-107.58597,25.5965],[-107.5852,25.59372],[-107.58632,25.59141],[-107.58933,25.5943],[-107.6084,25.58016],[-107.60956,25.57545],[-107.64028,25.55375],[-107.63908,25.54897],[-107.64002,25.54856],[-107.6386,25.54514],[-107.64095,25.5371],[-107.63551,25.53131],[-107.63882,25.52211],[-107.63808,25.51609],[-107.64075,25.51547],[-107.64162,25.51025],[-107.63974,25.5026],[-107.64008,25.49398],[-107.64425,25.49075],[-107.64589,25.49083],[-107.6457,25.48851],[-107.64898,25.48766],[-107.6495,25.48467],[-107.65603,25.48501],[-107.66322,25.48753],[-107.64653,25.4521],[-107.68611,25.44618],[-107.68463,25.44391],[-107.69438,25.42792],[-107.6913,25.42504],[-107.68688,25.41752],[-107.67981,25.40916],[-107.67685,25.4081],[-107.67592,25.409],[-107.67401,25.40864],[-107.67406,25.40744],[-107.67849,25.40472],[-107.68236,25.40493],[-107.6845,25.40245],[-107.687,25.40226],[-107.68807,25.40005],[-107.69032,25.40087],[-107.69045,25.39464],[-107.69355,25.39311],[-107.69381,25.38905],[-107.69548,25.38799],[-107.69505,25.38598],[-107.6986,25.38577],[-107.69885,25.38297],[-107.6973,25.38368],[-107.69553,25.38249],[-107.69551,25.3808],[-107.69737,25.3807],[-107.69819,25.38203],[-107.69922,25.38002],[-107.70143,25.3815],[-107.70228,25.38044],[-107.70057,25.37918],[-107.70225,25.37834],[-107.70274,25.3757],[-107.70447,25.37703],[-107.70601,25.3745],[-107.70876,25.37447],[-107.71119,25.37275],[-107.7145,25.37284],[-107.71685,25.37146],[-107.71797,25.37235],[-107.72092,25.37184],[-107.72372,25.36701],[-107.72266,25.36167],[-107.72805,25.36033],[-107.73118,25.35725],[-107.73432,25.35834],[-107.73842,25.35793],[-107.7394,25.35631],[-107.73916,25.35387],[-107.74041,25.35324],[-107.74398,25.35221],[-107.74462,25.35352],[-107.74601,25.35337],[-107.74403,25.34904],[-107.74642,25.34745],[-107.74486,25.34491],[-107.74696,25.34265],[-107.75154,25.34182],[-107.75056,25.33674],[-107.75616,25.34131],[-107.79296,25.29776],[-107.79013,25.29702],[-107.78039,25.29735],[-107.77761,25.29809],[-107.77334,25.30125],[-107.76406,25.3027],[-107.76141,25.30608],[-107.76249,25.30862],[-107.76124,25.30922],[-107.76012,25.30794],[-107.76117,25.30998],[-107.75713,25.30947],[-107.75567,25.31101],[-107.75426,25.30985],[-107.75442,25.30758],[-107.75864,25.30307],[-107.75901,25.29794],[-107.75785,25.29575],[-107.74647,25.30771],[-107.7459,25.27203],[-107.74258,25.27013],[-107.71246,25.27197],[-107.71233,25.26771],[-107.7073,25.25878],[-107.70531,25.2581],[-107.70479,25.25652],[-107.70608,25.25617],[-107.70373,25.25307],[-107.70115,25.25303],[-107.69776,25.24628],[-107.69584,25.24526],[-107.6985,25.24271],[-107.69655,25.24129],[-107.69342,25.24201],[-107.69003,25.2389],[-107.69225,25.22925],[-107.68484,25.21951],[-107.67953,25.21604],[-107.67886,25.21331],[-107.67546,25.21394],[-107.67429,25.21763],[-107.67254,25.21821],[-107.66505,25.21543],[-107.66187,25.21207],[-107.65417,25.20879],[-107.65323,25.21223],[-107.64914,25.21496],[-107.64876,25.214],[-107.64579,25.21394],[-107.63795,25.21515],[-107.63713,25.21621],[-107.62991,25.2151],[-107.62882,25.21676],[-107.62938,25.22126],[-107.61225,25.22303],[-107.60841,25.22756],[-107.60366,25.22842],[-107.58041,25.21321],[-107.56518,25.2159],[-107.55606,25.21581],[-107.54878,25.2091],[-107.53864,25.19299],[-107.53841,25.1812],[-107.52289,25.1617],[-107.51201,25.139],[-107.51332,25.13577],[-107.52205,25.12366],[-107.52995,25.11572],[-107.52368,25.09058],[-107.52364,25.08747],[-107.5275,25.0791],[-107.55781,25.0703],[-107.59154,25.03848],[-107.58809,25.01753],[-107.59094,25.00245],[-107.59665,24.9927],[-107.58799,24.9943],[-107.58493,24.98998],[-107.57963,24.9879],[-107.57982,24.98649],[-107.58623,24.98446],[-107.58918,24.97769],[-107.60024,24.97293],[-107.60752,24.97197],[-107.61049,24.97326],[-107.61584,24.97065],[-107.61905,24.97426],[-107.62288,24.97443],[-107.62693,24.96646],[-107.63642,24.96284],[-107.63694,24.96133],[-107.63927,24.96132],[-107.63956,24.95904],[-107.6418,24.95796],[-107.64347,24.94801],[-107.64248,24.94756],[-107.64239,24.94558],[-107.64476,24.94305],[-107.64647,24.93887],[-107.65135,24.94165],[-107.65272,24.94074],[-107.64803,24.93706],[-107.65683,24.92757],[-107.65694,24.92872],[-107.65847,24.92763],[-107.66187,24.92877],[-107.66448,24.93135],[-107.67032,24.93122],[-107.68167,24.92895],[-107.68513,24.92545],[-107.68882,24.92828],[-107.69149,24.92553],[-107.69793,24.92624],[-107.70006,24.92556],[-107.70141,24.92249],[-107.72303,24.92757],[-107.72529,24.92339],[-107.71985,24.91953],[-107.72303,24.91603],[-107.73677,24.92545],[-107.7362,24.92751],[-107.74444,24.93682],[-107.74462,24.93538],[-107.75158,24.93665],[-107.75154,24.93577],[-107.76019,24.93585],[-107.75673,24.9417],[-107.75787,24.94154],[-107.75826,24.94713],[-107.76576,24.94625],[-107.76652,24.95202],[-107.76879,24.951],[-107.77035,24.94832],[-107.77809,24.95159],[-107.78115,24.94567],[-107.78357,24.94982],[-107.79073,24.94951],[-107.79894,24.95443],[-107.79374,24.96221],[-107.79191,24.96303],[-107.79965,24.96635],[-107.80846,24.9796],[-107.8173,25.00447],[-107.82716,25.00762],[-107.84065,25.03215],[-107.88892,25.02058],[-107.88441,25.03319],[-107.89448,25.03334],[-107.89509,25.03158],[-107.89589,25.03236],[-107.89564,25.03495],[-107.90613,25.04958],[-107.90708,25.04912],[-107.90783,25.05016],[-107.90823,25.05278],[-107.90724,25.05281],[-107.90683,25.05482],[-107.90791,25.05592],[-107.90985,25.05472],[-107.90987,25.06311],[-107.91167,25.06395],[-107.9123,25.06311],[-107.9197,25.06312],[-107.91971,25.05994],[-107.929,25.06634],[-107.92645,25.06863],[-107.92614,25.0784],[-107.92973,25.07585],[-107.9314,25.07025],[-107.93369,25.07752],[-107.93776,25.07664],[-107.93718,25.07027],[-107.93957,25.07029],[-107.93957,25.06847],[-107.94553,25.06848],[-107.9456,25.0865],[-107.94353,25.08648],[-107.94357,25.09098],[-107.93958,25.09113],[-107.93981,25.10528],[-107.93908,25.10528],[-107.93909,25.10673],[-107.93981,25.10928],[-107.93891,25.11358],[-107.93984,25.11357],[-107.93975,25.11455],[-107.9497,25.11454],[-107.9497,25.12254],[-107.95149,25.12261],[-107.95146,25.11807],[-107.95542,25.11806],[-107.95545,25.12255],[-107.9573,25.12264],[-107.95734,25.1271],[-107.95935,25.12728],[-107.95938,25.13179],[-107.99551,25.13169],[-107.99549,25.1341],[-107.99906,25.13403],[-107.98949,25.14988],[-107.98597,25.14995],[-107.98573,25.15749],[-107.98657,25.15747],[-107.98564,25.15828],[-107.97001,25.15431],[-107.96781,25.15612],[-107.97104,25.16364],[-107.9688,25.16466],[-107.96818,25.1626],[-107.96479,25.1612],[-107.96139,25.15653],[-107.95979,25.1565],[-107.95831,25.15422],[-107.95758,25.1554],[-107.95075,25.15201],[-107.95136,25.14808],[-107.9465,25.14801],[-107.94227,25.1493],[-107.93971,25.14794],[-107.9376,25.17072],[-107.93591,25.17872],[-107.93593,25.18617],[-107.93277,25.20413],[-107.87012,25.20362],[-107.86856,25.22877],[-107.87506,25.22869],[-107.87481,25.23534],[-107.87928,25.2375],[-107.87981,25.23488],[-107.88258,25.23447],[-107.88468,25.24025],[-107.89257,25.23857],[-107.89198,25.23959],[-107.89753,25.23847],[-107.89873,25.23908],[-107.8976,25.24647],[-107.90202,25.24477],[-107.9071,25.25419],[-107.90638,25.26353],[-107.92585,25.2991],[-107.92088,25.30365],[-107.91636,25.3034],[-107.91606,25.30496],[-107.91462,25.30473],[-107.91226,25.30637],[-107.90971,25.30564],[-107.90649,25.30717],[-107.90544,25.30518],[-107.90391,25.30477],[-107.89946,25.30677],[-107.89721,25.3121],[-107.90153,25.31541],[-107.90126,25.31837],[-107.90592,25.31982],[-107.91212,25.31977],[-107.91515,25.31549],[-107.9129,25.31149],[-107.91655,25.30994],[-107.91911,25.30934],[-107.93192,25.31024],[-107.94388,25.33201],[-107.95056,25.33763],[-107.94674,25.34096],[-107.944,25.34059],[-107.94018,25.34214],[-107.93952,25.34085],[-107.93623,25.34034],[-107.93619,25.34268],[-107.92943,25.34552],[-107.92813,25.35068],[-107.92648,25.35039],[-107.92506,25.35676],[-107.91966,25.36092],[-107.9155,25.3602],[-107.91436,25.36635],[-107.91556,25.36656],[-107.91418,25.37251],[-107.94431,25.37769],[-107.94684,25.38012],[-107.95102,25.38073],[-107.95118,25.38285],[-107.95007,25.38281],[-107.94941,25.38417],[-107.9492,25.38821],[-107.94737,25.39084],[-107.94742,25.3989],[-107.94379,25.41006],[-107.9403,25.41423],[-107.93598,25.41308],[-107.93322,25.41696],[-107.94474,25.4209],[-107.94974,25.40812],[-107.97526,25.40904],[-107.99628,25.41786],[-107.99992,25.43155],[-107.99198,25.43119],[-107.99986,25.44542],[-107.99982,25.45022],[-108.00362,25.4556],[-108.00089,25.45755],[-108.00139,25.45866],[-108.00457,25.46004],[-108.00569,25.46508],[-108.00777,25.46614],[-108.00608,25.46645],[-108.00706,25.46815],[-108.00488,25.47107],[-108.00164,25.48113],[-108.00397,25.4818],[-108.00562,25.48466],[-108.00372,25.49735],[-108.01027,25.50307],[-108.0178,25.49879],[-108.02189,25.49939],[-108.01866,25.50438],[-108.01105,25.50746],[-108.01103,25.50893],[-108.00818,25.51078],[-108.00921,25.51268],[-108.00918,25.51811],[-108.01491,25.52498],[-108.01724,25.52987],[-108.01626,25.53164],[-108.01785,25.53543],[-108.02032,25.53696],[-108.01769,25.54252],[-108.00971,25.54244],[-108.00837,25.54344],[-108.00867,25.54538],[-108.00975,25.54702],[-108.01353,25.54713],[-108.01358,25.55038],[-108.01127,25.55547],[-108.01365,25.55753],[-108.0167,25.558],[-108.02444,25.55482],[-108.02636,25.55531],[-108.02759,25.55788],[-108.02667,25.56103],[-108.01908,25.5631],[-108.01438,25.57367],[-108.01397,25.57929],[-108.01208,25.57933],[-108.01151,25.58179],[-108.0027,25.58623],[-108.00012,25.59307],[-108.00481,25.5959],[-108.01122,25.59211],[-108.01295,25.58773],[-108.01586,25.58921],[-108.01375,25.5937],[-108.02124,25.59493],[-108.02464,25.59243],[-108.02646,25.59339],[-108.0319,25.59248],[-108.0332,25.59137],[-108.03582,25.59197],[-108.0446,25.58836],[-108.04681,25.58622],[-108.04854,25.59088],[-108.0472,25.59631],[-108.04876,25.59867],[-108.0468,25.60142],[-108.04768,25.60225],[-108.04676,25.60907],[-108.04,25.61758],[-108.03741,25.62264],[-108.03684,25.63161],[-108.03402,25.64027],[-108.02868,25.64544],[-108.02716,25.65058],[-108.01718,25.64878],[-108.00379,25.63931],[-107.99446,25.63932],[-107.99082,25.65115],[-107.9844,25.64781],[-107.98438,25.6495],[-107.97212,25.65134],[-107.9688,25.65218],[-107.96679,25.65395],[-107.96261,25.65398],[-107.9614,25.65745],[-107.95628,25.65985],[-107.95711,25.66141],[-107.95002,25.66594],[-107.95748,25.68266],[-107.95784,25.68924],[-107.95384,25.6917],[-107.91466,25.66711],[-107.89962,25.67913],[-107.88454,25.68668],[-107.86611,25.6887],[-107.86414,25.69958],[-107.85369,25.69909],[-107.85755,25.71437],[-107.84346,25.71863],[-107.84235,25.72028],[-107.84085,25.72038],[-107.84007,25.72217],[-107.83777,25.72297],[-107.83892,25.72984],[-107.83534,25.7356],[-107.82921,25.73522],[-107.82581,25.73681],[-107.79929,25.72623],[-107.79874,25.72886],[-107.79718,25.73049],[-107.79532,25.73018],[-107.79512,25.73137],[-107.79779,25.73666],[-107.79731,25.73947],[-107.79851,25.73947],[-107.8016,25.74603],[-107.80139,25.74885],[-107.79769,25.7494],[-107.79294,25.75324],[-107.7925,25.75416],[-107.7944,25.75668],[-107.79262,25.75669],[-107.79097,25.75946],[-107.78914,25.75914],[-107.78664,25.75675],[-107.78338,25.75737],[-107.77865,25.755],[-107.77411,25.75015],[-107.77197,25.75241],[-107.76903,25.75345],[-107.76448,25.7517],[-107.75868,25.75326],[-107.7562,25.75023],[-107.73164,25.75581],[-107.73167,25.76099],[-107.72761,25.75935],[-107.7219,25.75865],[-107.72016,25.75946],[-107.71854,25.76178],[-107.71598,25.77042],[-107.71312,25.77246],[-107.69875,25.77322],[-107.69621,25.77436],[-107.68941,25.7735],[-107.68616,25.77473],[-107.67728,25.78258],[-107.68316,25.78451],[-107.68803,25.78958],[-107.69896,25.79515],[-107.69239,25.79729],[-107.64652,25.8123]]]}},{"type":"Feature","properties":{"name":"Rosario","cvegeo":"25014"},"geometry":{"type":"Polygon","coordinates":[[[-105.714,23.34962],[-105.7084,23.35039],[-105.70517,23.34873],[-105.70467,23.34214],[-105.70351,23.3401],[-105.70166,23.33989],[-105.69708,23.34176],[-105.694,23.34057],[-105.70016,23.33596],[-105.70218,23.33265],[-105.69884,23.32823],[-105.70078,23.32424],[-105.69668,23.32279],[-105.69372,23.32037],[-105.69233,23.31097],[-105.693,23.30981],[-105.69834,23.31023],[-105.69947,23.30772],[-105.69175,23.30514],[-105.68889,23.30747],[-105.68738,23.30714],[-105.68848,23.30514],[-105.69397,23.30131],[-105.69016,23.2978],[-105.69077,23.29462],[-105.68619,23.28659],[-105.68481,23.28574],[-105.67704,23.28578],[-105.67513,23.28216],[-105.67265,23.28164],[-105.66817,23.28293],[-105.66484,23.28266],[-105.66356,23.28394],[-105.66537,23.28632],[-105.66371,23.28742],[-105.65828,23.28219],[-105.65366,23.28172],[-105.64321,23.27648],[-105.64546,23.26937],[-105.64279,23.26597],[-105.64632,23.26368],[-105.64747,23.26155],[-105.64684,23.25337],[-105.63918,23.24502],[-105.63895,23.24359],[-105.6424,23.24004],[-105.64234,23.23808],[-105.6344,23.23811],[-105.63188,23.23739],[-105.63032,23.23558],[-105.63156,23.22496],[-105.62967,23.21924],[-105.63574,23.21475],[-105.63034,23.2075],[-105.62971,23.20229],[-105.63368,23.19986],[-105.63523,23.19692],[-105.63434,23.18978],[-105.63662,23.18785],[-105.63953,23.18712],[-105.64072,23.18545],[-105.63416,23.17645],[-105.63304,23.17345],[-105.63375,23.17102],[-105.63887,23.16762],[-105.63688,23.15592],[-105.64581,23.1515],[-105.64618,23.14889],[-105.64399,23.14177],[-105.62994,23.13088],[-105.62397,23.12239],[-105.61876,23.1263],[-105.61643,23.12565],[-105.61774,23.12318],[-105.61698,23.12199],[-105.61153,23.12255],[-105.60696,23.12179],[-105.60579,23.11825],[-105.60818,23.1184],[-105.60905,23.11664],[-105.60583,23.11599],[-105.60377,23.11293],[-105.60142,23.11409],[-105.59764,23.10915],[-105.59457,23.11117],[-105.59033,23.10929],[-105.58425,23.11286],[-105.58195,23.11175],[-105.58036,23.10935],[-105.57771,23.10884],[-105.57471,23.11006],[-105.57622,23.10758],[-105.57538,23.10497],[-105.57389,23.1062],[-105.57017,23.10672],[-105.57105,23.10869],[-105.56934,23.11006],[-105.56569,23.1083],[-105.56168,23.10405],[-105.55894,23.10369],[-105.5572,23.10058],[-105.55431,23.09889],[-105.551,23.09919],[-105.54934,23.10037],[-105.54861,23.10442],[-105.54621,23.1033],[-105.53707,23.10454],[-105.53744,23.10765],[-105.53413,23.10992],[-105.53377,23.1117],[-105.53162,23.11336],[-105.53245,23.11514],[-105.53122,23.11806],[-105.5275,23.11994],[-105.52511,23.11989],[-105.51786,23.12491],[-105.51388,23.12402],[-105.51237,23.12516],[-105.50777,23.12506],[-105.50403,23.12773],[-105.50198,23.12801],[-105.45532,23.11734],[-105.44756,23.11968],[-105.44037,23.1167],[-105.43408,23.12046],[-105.42234,23.11977],[-105.41977,23.11753],[-105.41589,23.1169],[-105.41303,23.11251],[-105.41311,23.10953],[-105.40853,23.1032],[-105.40142,23.10348],[-105.3988,23.10221],[-105.40123,23.09618],[-105.39984,23.09446],[-105.40028,23.09286],[-105.39913,23.09232],[-105.39957,23.08975],[-105.3958,23.08649],[-105.39231,23.08533],[-105.39225,23.08408],[-105.413,23.0741],[-105.41378,23.06895],[-105.4122,23.06781],[-105.41297,23.06375],[-105.41119,23.06228],[-105.41155,23.06049],[-105.4104,23.0601],[-105.41176,23.05627],[-105.41205,23.04827],[-105.40986,23.04494],[-105.41157,23.04116],[-105.41013,23.03908],[-105.41316,23.03705],[-105.41155,23.03461],[-105.41168,23.03036],[-105.41081,23.02738],[-105.40914,23.02692],[-105.40895,23.02364],[-105.43259,23.02397],[-105.45331,22.9774],[-105.50126,22.95856],[-105.4961,22.93422],[-105.49865,22.93356],[-105.47122,22.88329],[-105.47533,22.88062],[-105.4842,22.8587],[-105.47459,22.85142],[-105.47523,22.84992],[-105.47692,22.84996],[-105.47652,22.84798],[-105.47866,22.84616],[-105.47918,22.84199],[-105.48196,22.84209],[-105.4872,22.83911],[-105.4857,22.83526],[-105.48825,22.83234],[-105.48771,22.83095],[-105.48659,22.83163],[-105.48878,22.82961],[-105.48775,22.82601],[-105.49019,22.82444],[-105.49341,22.82616],[-105.49285,22.82136],[-105.49586,22.81736],[-105.49337,22.81523],[-105.49648,22.81404],[-105.4949,22.81298],[-105.49494,22.81062],[-105.50087,22.81611],[-105.50599,22.81595],[-105.5096,22.81838],[-105.5108,22.81675],[-105.5128,22.81622],[-105.52283,22.81866],[-105.52893,22.82531],[-105.53007,22.82812],[-105.53408,22.83063],[-105.53264,22.83211],[-105.53393,22.83441],[-105.53214,22.83775],[-105.53211,22.84633],[-105.52959,22.84837],[-105.53254,22.85171],[-105.53646,22.85184],[-105.54034,22.86097],[-105.53995,22.86324],[-105.54535,22.86409],[-105.5451,22.86639],[-105.54882,22.86873],[-105.55027,22.87298],[-105.55394,22.87112],[-105.55815,22.87227],[-105.56127,22.86964],[-105.56396,22.8717],[-105.56823,22.87036],[-105.57824,22.87068],[-105.57957,22.87379],[-105.57744,22.87912],[-105.58495,22.88011],[-105.585,22.88401],[-105.58795,22.885],[-105.5925,22.89005],[-105.59535,22.89678],[-105.59709,22.89803],[-105.59495,22.89982],[-105.59373,22.90373],[-105.59014,22.90449],[-105.59495,22.91494],[-105.59886,22.91933],[-105.60046,22.92019],[-105.60317,22.91471],[-105.60854,22.91395],[-105.61926,22.90808],[-105.61786,22.90302],[-105.61803,22.8973],[-105.61953,22.89744],[-105.61981,22.89663],[-105.62664,22.8994],[-105.62933,22.89952],[-105.62975,22.89794],[-105.63154,22.8974],[-105.64048,22.89789],[-105.64477,22.89989],[-105.65822,22.90174],[-105.65608,22.88173],[-105.67871,22.89415],[-105.75239,22.9605],[-105.75978,22.96247],[-105.78878,22.94485],[-105.80403,22.93958],[-105.80868,22.92577],[-105.81164,22.92476],[-105.8149,22.92813],[-105.81572,22.92392],[-105.81444,22.92111],[-105.81569,22.91866],[-105.81827,22.92086],[-105.81777,22.91512],[-105.8264,22.90957],[-105.82476,22.90479],[-105.82518,22.89355],[-105.83005,22.89176],[-105.83526,22.89197],[-105.83609,22.8878],[-105.83837,22.88408],[-105.83997,22.88742],[-105.85622,22.88457],[-105.83109,22.85039],[-105.81656,22.836],[-105.82311,22.83547],[-105.82575,22.83638],[-105.83132,22.83378],[-105.83329,22.8373],[-105.83447,22.831],[-105.836,22.83199],[-105.839,22.82784],[-105.84497,22.8248],[-105.84846,22.8247],[-105.8506,22.82562],[-105.85395,22.82986],[-105.85412,22.83352],[-105.85674,22.832],[-105.85543,22.82864],[-105.86112,22.82651],[-105.86554,22.82722],[-105.86935,22.83068],[-105.87455,22.83126],[-105.87764,22.83674],[-105.87678,22.83831],[-105.8727,22.83898],[-105.87056,22.84204],[-105.87071,22.84417],[-105.87262,22.8417],[-105.87373,22.84222],[-105.87766,22.8394],[-105.87729,22.83809],[-105.87833,22.83807],[-105.88133,22.84348],[-105.88331,22.84106],[-105.8879,22.84264],[-105.89059,22.8459],[-105.89011,22.84764],[-105.90803,22.85182],[-105.91051,22.84975],[-105.91379,22.85027],[-105.91889,22.8459],[-105.92118,22.84541],[-105.9232,22.84674],[-105.92523,22.84648],[-105.93432,22.84004],[-105.93713,22.84084],[-105.93956,22.84573],[-105.93959,22.84953],[-105.9419,22.85098],[-105.94503,22.84638],[-105.94682,22.84616],[-105.97314,22.82283],[-105.97786,22.82287],[-105.98584,22.82576],[-105.9892,22.82494],[-105.99003,22.82396],[-105.98873,22.82296],[-105.998,22.81311],[-106.02794,22.83165],[-106.03449,22.82971],[-106.03346,22.83147],[-106.03955,22.83575],[-106.06252,22.86702],[-106.15135,22.96703],[-106.20653,23.02308],[-106.23647,23.05066],[-106.25789,23.06844],[-106.24815,23.08023],[-106.25923,23.08938],[-106.25221,23.09579],[-106.24495,23.09182],[-106.23529,23.09351],[-106.22924,23.09079],[-106.22779,23.08142],[-106.22316,23.08228],[-106.22051,23.09534],[-106.20396,23.09085],[-106.1884,23.10368],[-106.18845,23.10568],[-106.18954,23.1065],[-106.18894,23.10739],[-106.19149,23.10699],[-106.19112,23.10954],[-106.19284,23.11053],[-106.1924,23.11243],[-106.19407,23.11499],[-106.19334,23.11725],[-106.19138,23.11883],[-106.19168,23.12059],[-106.18938,23.121],[-106.18948,23.11502],[-106.18783,23.11552],[-106.18563,23.11373],[-106.18625,23.11203],[-106.18315,23.11224],[-106.18271,23.11128],[-106.18391,23.11037],[-106.18237,23.10921],[-106.17735,23.11288],[-106.16658,23.09955],[-106.15069,23.0866],[-106.14996,23.08751],[-106.14739,23.08693],[-106.14583,23.08786],[-106.1406,23.08713],[-106.14035,23.08537],[-106.13076,23.09888],[-106.10583,23.07598],[-106.09634,23.08979],[-106.10233,23.09549],[-106.09271,23.11079],[-106.07766,23.09827],[-106.07689,23.09928],[-106.07909,23.10264],[-106.0776,23.10691],[-106.07659,23.10605],[-106.0725,23.10872],[-106.06918,23.10936],[-106.07064,23.114],[-106.069,23.11491],[-106.06776,23.11359],[-106.06565,23.11467],[-106.06356,23.11322],[-106.0606,23.11448],[-106.04566,23.10531],[-106.03846,23.11553],[-106.02668,23.10885],[-106.0131,23.09653],[-106.01174,23.09727],[-106.01035,23.10045],[-106.0078,23.10078],[-106.00723,23.10177],[-106.00464,23.10114],[-105.99919,23.10495],[-105.99705,23.10497],[-105.99432,23.10657],[-105.98686,23.10632],[-105.98077,23.1083],[-105.97936,23.11238],[-105.98244,23.11571],[-105.98047,23.12015],[-105.97847,23.11821],[-105.97642,23.11152],[-105.974,23.10753],[-105.97616,23.10657],[-105.97658,23.10524],[-105.97156,23.10434],[-105.96804,23.09645],[-105.96398,23.09548],[-105.96332,23.09389],[-105.96565,23.09017],[-105.96186,23.08887],[-105.96306,23.08705],[-105.96302,23.08458],[-105.9306,23.11796],[-105.909,23.11932],[-105.90992,23.13888],[-105.92645,23.1782],[-105.9227,23.19005],[-105.9372,23.19334],[-105.93835,23.19999],[-105.94343,23.20077],[-105.94923,23.23453],[-105.92813,23.23873],[-105.92935,23.2426],[-105.93299,23.24691],[-105.93607,23.24886],[-105.93647,23.25489],[-105.93569,23.25753],[-105.93304,23.25857],[-105.93986,23.26765],[-105.93055,23.32155],[-105.91729,23.33173],[-105.83876,23.30775],[-105.84895,23.32995],[-105.73857,23.33861],[-105.71804,23.36853],[-105.71538,23.36682],[-105.71556,23.36552],[-105.71187,23.36341],[-105.71189,23.35597],[-105.71558,23.35196],[-105.71448,23.34982],[-105.714,23.34962]]]}},{"type":"Feature","properties":{"name":"Salvador Alvarado","cvegeo":"25015"},"geometry":{"type":"Polygon","coordinates":[[[-108.18053,25.61368],[-108.17411,25.60786],[-108.17215,25.60897],[-108.16733,25.60402],[-108.16355,25.60395],[-108.16347,25.60695],[-108.15868,25.60697],[-108.15812,25.60407],[-108.12535,25.60504],[-108.12428,25.60512],[-108.12406,25.60665],[-108.12041,25.60667],[-108.1186,25.60527],[-108.1177,25.5858],[-108.09371,25.59406],[-108.09313,25.60447],[-108.08761,25.60174],[-108.08358,25.60108],[-108.08431,25.59984],[-108.07127,25.5905],[-108.06849,25.59292],[-108.06077,25.58843],[-108.05934,25.58974],[-108.05747,25.58915],[-108.05563,25.59091],[-108.0548,25.58908],[-108.04826,25.59178],[-108.04681,25.58622],[-108.0446,25.58836],[-108.03582,25.59197],[-108.0332,25.59137],[-108.0319,25.59248],[-108.02646,25.59339],[-108.02464,25.59243],[-108.02124,25.59493],[-108.01375,25.5937],[-108.01586,25.58921],[-108.01295,25.58773],[-108.01122,25.59211],[-108.00481,25.5959],[-108.00012,25.59307],[-108.0027,25.58623],[-108.01151,25.58179],[-108.01208,25.57933],[-108.01397,25.57929],[-108.01438,25.57367],[-108.01908,25.5631],[-108.02667,25.56103],[-108.02759,25.55788],[-108.02636,25.55531],[-108.02444,25.55482],[-108.0167,25.558],[-108.01365,25.55753],[-108.01127,25.55547],[-108.01358,25.55038],[-108.01353,25.54713],[-108.00975,25.54702],[-108.00867,25.54538],[-108.00837,25.54344],[-108.00971,25.54244],[-108.01769,25.54252],[-108.02032,25.53696],[-108.01785,25.53543],[-108.01626,25.53164],[-108.01724,25.52987],[-108.01491,25.52498],[-108.00918,25.51811],[-108.00921,25.51268],[-108.00818,25.51078],[-108.01103,25.50893],[-108.01105,25.50746],[-108.01866,25.50438],[-108.02189,25.49939],[-108.0178,25.49879],[-108.01027,25.50307],[-108.00372,25.49735],[-108.00562,25.48466],[-108.00397,25.4818],[-108.00164,25.48113],[-108.00488,25.47107],[-108.00706,25.46815],[-108.00608,25.46645],[-108.00777,25.46614],[-108.00569,25.46508],[-108.00457,25.46004],[-108.00139,25.45866],[-108.00089,25.45755],[-108.00362,25.4556],[-107.99982,25.45022],[-107.99986,25.44542],[-107.99198,25.43119],[-107.99992,25.43155],[-107.99628,25.41786],[-107.97526,25.40904],[-107.94974,25.40812],[-107.94474,25.4209],[-107.93322,25.41696],[-107.93598,25.41308],[-107.9403,25.41423],[-107.94379,25.41006],[-107.94742,25.3989],[-107.94737,25.39084],[-107.9492,25.38821],[-107.94941,25.38417],[-107.95007,25.38281],[-107.95118,25.38285],[-107.95102,25.38073],[-107.94684,25.38012],[-107.94431,25.37769],[-107.91418,25.37251],[-107.91556,25.36656],[-107.91436,25.36635],[-107.9155,25.3602],[-107.91966,25.36092],[-107.92506,25.35676],[-107.92648,25.35039],[-107.92813,25.35068],[-107.92943,25.34552],[-107.93619,25.34268],[-107.93623,25.34034],[-107.93952,25.34085],[-107.94018,25.34214],[-107.944,25.34059],[-107.94674,25.34096],[-107.95056,25.33763],[-107.94388,25.33201],[-107.93192,25.31024],[-107.91911,25.30934],[-107.91655,25.30994],[-107.9129,25.31149],[-107.91515,25.31549],[-107.91212,25.31977],[-107.90592,25.31982],[-107.90126,25.31837],[-107.90153,25.31541],[-107.89721,25.3121],[-107.89946,25.30677],[-107.90391,25.30477],[-107.90544,25.30518],[-107.90649,25.30717],[-107.90971,25.30564],[-107.91226,25.30637],[-107.91462,25.30473],[-107.91606,25.30496],[-107.91636,25.3034],[-107.92088,25.30365],[-107.92585,25.2991],[-107.90638,25.26353],[-107.9071,25.25419],[-107.90202,25.24477],[-107.8976,25.24647],[-107.89873,25.23908],[-107.89753,25.23847],[-107.89198,25.23959],[-107.89257,25.23857],[-107.88468,25.24025],[-107.88258,25.23447],[-107.87981,25.23488],[-107.87928,25.2375],[-107.87481,25.23534],[-107.87506,25.22869],[-107.86856,25.22877],[-107.87012,25.20362],[-107.93277,25.20413],[-107.93593,25.18617],[-107.93591,25.17872],[-107.9376,25.17072],[-107.93971,25.14794],[-107.94227,25.1493],[-107.9465,25.14801],[-107.95136,25.14808],[-107.95075,25.15201],[-107.95758,25.1554],[-107.95831,25.15422],[-107.95979,25.1565],[-107.96139,25.15653],[-107.96479,25.1612],[-107.96818,25.1626],[-107.972,25.17706],[-107.96949,25.18081],[-107.97706,25.19234],[-107.98836,25.22132],[-107.993,25.223],[-107.99542,25.22206],[-107.99579,25.22022],[-108.01506,25.22013],[-108.03323,25.23257],[-108.03247,25.23399],[-108.03523,25.23649],[-108.0381,25.236],[-108.03814,25.23887],[-108.03392,25.23957],[-108.03119,25.24146],[-108.02588,25.24114],[-108.02032,25.24476],[-108.01918,25.24747],[-108.00687,25.25062],[-108.00069,25.25342],[-108.00439,25.26291],[-108.03404,25.30058],[-108.03277,25.30084],[-108.03226,25.30325],[-108.03105,25.30379],[-108.03312,25.30697],[-108.03446,25.32425],[-108.04235,25.33007],[-108.04321,25.34151],[-108.04538,25.34129],[-108.04272,25.35303],[-108.0417,25.35286],[-108.04049,25.35493],[-108.04104,25.36252],[-108.02916,25.35945],[-108.0282,25.3611],[-108.02832,25.36468],[-108.02657,25.36635],[-108.02633,25.36918],[-108.03753,25.36827],[-108.03329,25.37514],[-108.03343,25.3795],[-108.03037,25.38165],[-108.02857,25.38118],[-108.02779,25.38288],[-108.03054,25.38487],[-108.03601,25.38527],[-108.03092,25.38884],[-108.03361,25.39255],[-108.03668,25.3944],[-108.04159,25.39379],[-108.04269,25.39451],[-108.05094,25.39097],[-108.09723,25.4224],[-108.08791,25.42774],[-108.0885,25.42932],[-108.08581,25.43091],[-108.0831,25.43094],[-108.0862,25.43578],[-108.08757,25.43439],[-108.08863,25.43523],[-108.08785,25.43645],[-108.08822,25.43957],[-108.09028,25.44102],[-108.09075,25.44024],[-108.08966,25.43987],[-108.09068,25.43754],[-108.09182,25.43804],[-108.09436,25.4344],[-108.09711,25.43387],[-108.09707,25.43806],[-108.10068,25.43826],[-108.10182,25.44014],[-108.10112,25.44112],[-108.0996,25.4409],[-108.09999,25.43957],[-108.09713,25.43935],[-108.09494,25.44398],[-108.10285,25.45053],[-108.1175,25.44154],[-108.1167,25.43672],[-108.11966,25.43601],[-108.12161,25.43427],[-108.12127,25.43342],[-108.12806,25.43281],[-108.12812,25.43177],[-108.13683,25.42986],[-108.13888,25.42846],[-108.14391,25.41071],[-108.15564,25.40283],[-108.15552,25.40176],[-108.162,25.4011],[-108.16173,25.39974],[-108.16056,25.39984],[-108.16169,25.39445],[-108.1626,25.39595],[-108.16985,25.39815],[-108.1776,25.40419],[-108.16658,25.40575],[-108.16806,25.41649],[-108.169,25.4179],[-108.17765,25.41311],[-108.17832,25.41362],[-108.18467,25.40917],[-108.18594,25.41175],[-108.18303,25.42534],[-108.18954,25.42643],[-108.19476,25.42537],[-108.18662,25.40813],[-108.21344,25.39289],[-108.23354,25.3796],[-108.23109,25.37766],[-108.23257,25.37638],[-108.23264,25.36982],[-108.23669,25.36962],[-108.25616,25.36187],[-108.25952,25.36139],[-108.26205,25.37026],[-108.26366,25.37254],[-108.27239,25.37136],[-108.27453,25.35963],[-108.28201,25.35867],[-108.28554,25.36005],[-108.29353,25.35922],[-108.29348,25.35369],[-108.29168,25.35208],[-108.29353,25.35303],[-108.29206,25.3488],[-108.29962,25.35185],[-108.29348,25.3803],[-108.29662,25.38092],[-108.29882,25.37098],[-108.30709,25.37367],[-108.30707,25.39345],[-108.30496,25.39357],[-108.30271,25.39914],[-108.29032,25.39596],[-108.28369,25.42881],[-108.27926,25.45351],[-108.28043,25.45376],[-108.27677,25.4708],[-108.27169,25.47428],[-108.26656,25.47512],[-108.26251,25.47822],[-108.25957,25.47849],[-108.25717,25.48181],[-108.25268,25.48504],[-108.25263,25.48676],[-108.22016,25.49053],[-108.19309,25.48255],[-108.18918,25.48653],[-108.19679,25.51094],[-108.20446,25.51398],[-108.20183,25.52613],[-108.19558,25.53044],[-108.19634,25.5338],[-108.19075,25.53685],[-108.1895,25.55059],[-108.2135,25.5897],[-108.20794,25.59202],[-108.19042,25.60693],[-108.18811,25.60666],[-108.18523,25.60972],[-108.18495,25.61173],[-108.18256,25.6134],[-108.18177,25.61294],[-108.18053,25.61368]]]}},{"type":"Feature","properties":{"name":"San Ignacio","cvegeo":"25016"},"geometry":{"type":"Polygon","coordinates":[[[-106.17358,24.33633],[-106.16998,24.33365],[-106.15254,24.33877],[-106.08982,24.28536],[-106.08888,24.28441],[-106.08929,24.2818],[-106.0869,24.27769],[-106.08305,24.27562],[-106.08132,24.27335],[-106.07715,24.27256],[-106.07584,24.27139],[-106.07454,24.26942],[-106.07479,24.2669],[-106.07207,24.25627],[-106.06995,24.2202],[-106.04388,24.22085],[-106.04416,24.2117],[-106.03638,24.20402],[-106.03525,24.20059],[-106.03621,24.19818],[-106.03482,24.19712],[-106.03398,24.19189],[-106.03068,24.18845],[-106.02681,24.18653],[-106.02803,24.18467],[-106.02753,24.18291],[-106.02856,24.18033],[-106.02662,24.17973],[-106.02489,24.17597],[-106.02354,24.17599],[-106.02309,24.1741],[-106.02108,24.17318],[-106.0182,24.16445],[-106.01413,24.16144],[-106.01205,24.16124],[-106.01063,24.15823],[-106.01098,24.15685],[-106.00747,24.15377],[-106.00617,24.15093],[-106.00653,24.14871],[-106.00321,24.14684],[-106.00432,24.1449],[-106.00306,24.14353],[-106.00299,24.1408],[-106.00397,24.14003],[-106.00199,24.13869],[-106.00399,24.13766],[-106.0033,24.13518],[-106.0042,24.12996],[-106.00124,24.12832],[-106.00367,24.12527],[-106.00293,24.12348],[-106.00405,24.12053],[-105.99984,24.11833],[-105.99972,24.11635],[-105.99665,24.11446],[-105.98972,24.11439],[-105.98908,24.108],[-105.99108,24.10564],[-105.98944,24.10236],[-105.9932,24.10122],[-105.99347,24.09917],[-105.99563,24.09829],[-105.99401,24.09357],[-105.99632,24.08936],[-105.99942,24.09011],[-106.00207,24.08809],[-106.0006,24.08639],[-106.0027,24.08317],[-106.00116,24.08134],[-106.00071,24.07606],[-106.00364,24.07617],[-106.00514,24.07378],[-106.00788,24.07251],[-106.00661,24.06719],[-106.00295,24.06606],[-106.00118,24.06309],[-106.00132,24.06032],[-106.00249,24.05946],[-106.00023,24.05808],[-105.99986,24.05507],[-105.99672,24.05422],[-105.9995,24.04971],[-106.00007,24.04652],[-105.99872,24.04338],[-105.99788,24.04252],[-105.9941,24.04458],[-105.99185,24.04145],[-105.98903,24.042],[-105.98707,24.03961],[-105.98427,24.03868],[-105.98277,24.03937],[-105.98186,24.04156],[-105.97951,24.04196],[-105.97853,24.03956],[-105.9734,24.03443],[-105.97304,24.03274],[-105.96655,24.03184],[-105.96541,24.02707],[-105.96287,24.02666],[-105.95981,24.02383],[-105.95937,24.023],[-105.96097,24.02192],[-105.95981,24.0174],[-105.95831,24.01753],[-105.95634,24.01562],[-105.95362,24.01596],[-105.95026,24.01482],[-105.94871,24.01177],[-105.9469,24.01516],[-105.94595,24.01489],[-105.94598,24.0122],[-105.94405,24.01408],[-105.94234,24.01432],[-105.94093,24.01018],[-105.93908,24.00931],[-105.93945,24.00732],[-105.93737,24.00632],[-105.93763,24.00499],[-105.93428,24.00212],[-105.93251,24.00274],[-105.93183,24.00073],[-105.92941,24.00069],[-105.92887,23.99929],[-105.92301,23.99805],[-105.92119,23.99952],[-105.91709,24.0001],[-105.91214,23.99753],[-105.91293,23.99201],[-105.90872,23.98663],[-105.90846,23.98343],[-105.94542,23.94803],[-105.89992,23.94392],[-105.88155,23.93282],[-105.87899,23.92607],[-105.86598,23.91607],[-105.86389,23.91282],[-105.86528,23.90822],[-105.86414,23.90532],[-105.86355,23.90425],[-105.86159,23.9044],[-105.86124,23.90277],[-105.85884,23.90213],[-105.85775,23.89982],[-105.85909,23.89463],[-105.85851,23.89309],[-105.86327,23.88945],[-105.8611,23.88742],[-105.8611,23.88483],[-105.86187,23.8843],[-105.86265,23.88527],[-105.86356,23.88441],[-105.86324,23.8811],[-105.86549,23.88072],[-105.8629,23.87792],[-105.86477,23.87516],[-105.8833,23.87855],[-105.95366,23.90858],[-105.96127,23.84074],[-105.95188,23.81965],[-106.06833,23.89116],[-106.1597,23.77022],[-106.11543,23.72852],[-106.17314,23.70739],[-106.17921,23.66319],[-106.20333,23.67756],[-106.20566,23.67654],[-106.20615,23.67458],[-106.20433,23.67371],[-106.20756,23.67192],[-106.20515,23.67213],[-106.20431,23.6709],[-106.20631,23.66819],[-106.2092,23.66787],[-106.20744,23.66606],[-106.21012,23.66596],[-106.20952,23.66472],[-106.20762,23.66444],[-106.2084,23.66334],[-106.21211,23.66324],[-106.21107,23.66109],[-106.20881,23.65989],[-106.20914,23.65828],[-106.21239,23.65555],[-106.21768,23.65764],[-106.2202,23.65732],[-106.22071,23.65547],[-106.22328,23.65366],[-106.22723,23.65426],[-106.22931,23.65009],[-106.22804,23.64882],[-106.2324,23.64591],[-106.23155,23.64084],[-106.23441,23.63923],[-106.23445,23.64165],[-106.23614,23.64235],[-106.23586,23.63738],[-106.23669,23.63595],[-106.2384,23.63591],[-106.23943,23.63759],[-106.24232,23.63722],[-106.24151,23.63902],[-106.24324,23.64271],[-106.24726,23.63888],[-106.2467,23.63751],[-106.24814,23.63646],[-106.24638,23.63571],[-106.25019,23.63458],[-106.24896,23.63377],[-106.24938,23.6295],[-106.2518,23.62981],[-106.25161,23.63233],[-106.25416,23.63062],[-106.25413,23.62701],[-106.25269,23.62415],[-106.25582,23.62488],[-106.26039,23.6234],[-106.26142,23.62217],[-106.25948,23.62114],[-106.26039,23.61866],[-106.26259,23.6184],[-106.2652,23.61958],[-106.26525,23.61739],[-106.26668,23.61538],[-106.26426,23.61322],[-106.26706,23.61404],[-106.26676,23.60865],[-106.26952,23.60694],[-106.27216,23.60671],[-106.2728,23.60472],[-106.27174,23.60326],[-106.27579,23.60536],[-106.2788,23.60292],[-106.27764,23.60174],[-106.28072,23.6003],[-106.2829,23.60102],[-106.28426,23.60019],[-106.28586,23.60283],[-106.29012,23.60019],[-106.29133,23.60281],[-106.29435,23.60189],[-106.29456,23.60393],[-106.29592,23.60462],[-106.29843,23.60252],[-106.30017,23.60298],[-106.30272,23.60114],[-106.30391,23.60133],[-106.30642,23.60424],[-106.3094,23.60438],[-106.31032,23.60574],[-106.31049,23.60956],[-106.30809,23.61171],[-106.31065,23.61467],[-106.31381,23.61412],[-106.31492,23.6151],[-106.31736,23.61407],[-106.32055,23.61521],[-106.32366,23.6144],[-106.32962,23.61726],[-106.33195,23.61527],[-106.33671,23.62467],[-106.34148,23.62612],[-106.34085,23.6285],[-106.34191,23.63037],[-106.34505,23.63089],[-106.34766,23.63437],[-106.35165,23.6339],[-106.35344,23.6383],[-106.35659,23.6384],[-106.35878,23.64058],[-106.3622,23.63907],[-106.36638,23.64103],[-106.36914,23.63815],[-106.38596,23.67768],[-106.41655,23.69268],[-106.45209,23.69792],[-106.46672,23.69876],[-106.47729,23.68947],[-106.52119,23.69104],[-106.5296,23.66814],[-106.5266,23.66417],[-106.52933,23.66017],[-106.52579,23.64453],[-106.51873,23.62424],[-106.59742,23.61619],[-106.6045,23.55079],[-106.61479,23.50123],[-106.61837,23.47351],[-106.6231,23.4777],[-106.62632,23.4777],[-106.6295,23.48164],[-106.6299,23.4899],[-106.62628,23.49196],[-106.62755,23.49692],[-106.64146,23.51038],[-106.6496,23.5167],[-106.6533,23.5182],[-106.6722,23.5354],[-106.67709,23.53889],[-106.68176,23.54059],[-106.68202,23.54389],[-106.68582,23.55021],[-106.68403,23.55213],[-106.6851,23.5568],[-106.68794,23.56046],[-106.69058,23.56201],[-106.6939,23.5678],[-106.6994,23.5735],[-106.72916,23.59516],[-106.7536,23.6091],[-106.76417,23.61322],[-106.76878,23.62146],[-106.7812,23.6312],[-106.78441,23.63164],[-106.78507,23.63536],[-106.7872,23.6371],[-106.78903,23.63723],[-106.78897,23.63935],[-106.79006,23.64046],[-106.8021,23.6482],[-106.80383,23.64841],[-106.80446,23.6472],[-106.80647,23.648],[-106.80852,23.65036],[-106.80803,23.65173],[-106.81008,23.65172],[-106.81095,23.65279],[-106.80995,23.65363],[-106.8112,23.65509],[-106.8116,23.6581],[-106.80431,23.66043],[-106.80338,23.66542],[-106.80427,23.66759],[-106.80299,23.66818],[-106.8019,23.66595],[-106.80065,23.66574],[-106.79769,23.66664],[-106.79655,23.66819],[-106.79506,23.67171],[-106.79435,23.67787],[-106.7954,23.68188],[-106.80358,23.69485],[-106.80917,23.70001],[-106.81368,23.708],[-106.82235,23.71808],[-106.847,23.74009],[-106.8444,23.7426],[-106.84312,23.75088],[-106.8441,23.75395],[-106.84772,23.75926],[-106.86193,23.77435],[-106.74006,23.78929],[-106.73794,23.80063],[-106.74289,23.80264],[-106.73742,23.83318],[-106.73171,23.83442],[-106.73564,23.85332],[-106.68554,23.89358],[-106.67691,23.90632],[-106.67055,23.91957],[-106.67192,23.9238],[-106.69042,23.94913],[-106.69657,23.95036],[-106.70315,23.94488],[-106.70892,23.95798],[-106.71066,23.95921],[-106.71398,23.95896],[-106.71524,23.96198],[-106.71489,23.96407],[-106.71249,23.96621],[-106.70795,23.96384],[-106.70657,23.96029],[-106.70407,23.95761],[-106.6991,23.96075],[-106.6961,23.96075],[-106.69426,23.95914],[-106.69106,23.9609],[-106.68839,23.98562],[-106.68527,23.99754],[-106.68199,24.00183],[-106.68148,24.00428],[-106.68233,24.00563],[-106.6799,24.01269],[-106.6754,24.01712],[-106.67538,24.01855],[-106.67856,24.02091],[-106.68006,24.0234],[-106.67786,24.03074],[-106.67064,24.03185],[-106.66597,24.03605],[-106.66371,24.04078],[-106.65694,24.04426],[-106.65474,24.04808],[-106.65568,24.05125],[-106.65767,24.05289],[-106.65929,24.05809],[-106.65487,24.06014],[-106.65335,24.0648],[-106.65378,24.06958],[-106.65869,24.0822],[-106.66261,24.08577],[-106.6748,24.09037],[-106.67667,24.09667],[-106.6806,24.1014],[-106.67764,24.10859],[-106.67876,24.11629],[-106.68187,24.11902],[-106.69305,24.12087],[-106.69571,24.12043],[-106.69472,24.12365],[-106.69606,24.12506],[-106.69629,24.12804],[-106.6942,24.12805],[-106.69355,24.12662],[-106.69067,24.12602],[-106.69004,24.12661],[-106.69197,24.12995],[-106.68865,24.13084],[-106.68712,24.12903],[-106.67762,24.13158],[-106.67547,24.13059],[-106.67394,24.13219],[-106.67524,24.13437],[-106.67063,24.13698],[-106.66873,24.13628],[-106.66815,24.13837],[-106.664,24.13489],[-106.66466,24.13696],[-106.66351,24.13814],[-106.6683,24.14244],[-106.66517,24.1455],[-106.66111,24.14429],[-106.6565,24.13675],[-106.65326,24.1357],[-106.64832,24.13619],[-106.64634,24.13802],[-106.64561,24.14],[-106.65257,24.14539],[-106.65415,24.14837],[-106.6543,24.1512],[-106.65291,24.15285],[-106.64812,24.15443],[-106.64724,24.1575],[-106.64346,24.15997],[-106.63785,24.156],[-106.63439,24.15602],[-106.63201,24.16017],[-106.63486,24.1642],[-106.63515,24.16817],[-106.62946,24.1709],[-106.63075,24.17599],[-106.62904,24.17725],[-106.62583,24.17733],[-106.62379,24.17893],[-106.62059,24.1848],[-106.62113,24.19142],[-106.61843,24.1942],[-106.61904,24.19727],[-106.62099,24.19945],[-106.60675,24.20442],[-106.60482,24.20696],[-106.60589,24.21118],[-106.60901,24.2113],[-106.61066,24.21356],[-106.61038,24.21476],[-106.60648,24.21573],[-106.60378,24.21851],[-106.60304,24.22095],[-106.60489,24.22147],[-106.60721,24.22022],[-106.61128,24.22093],[-106.61096,24.22496],[-106.61342,24.22786],[-106.6117,24.22847],[-106.61191,24.22998],[-106.61039,24.23069],[-106.60965,24.23314],[-106.60536,24.2349],[-106.60586,24.23771],[-106.59827,24.23738],[-106.5933,24.23571],[-106.59072,24.23333],[-106.58626,24.23258],[-106.5805,24.22976],[-106.57498,24.22974],[-106.57198,24.22871],[-106.56743,24.22507],[-106.56119,24.22638],[-106.55947,24.22404],[-106.55641,24.22635],[-106.552,24.22698],[-106.55127,24.22387],[-106.54879,24.22255],[-106.54899,24.22497],[-106.54804,24.22539],[-106.54633,24.22439],[-106.54442,24.22552],[-106.54226,24.22388],[-106.53824,24.22481],[-106.53575,24.22384],[-106.53567,24.22586],[-106.53201,24.22812],[-106.52817,24.22688],[-106.52601,24.2235],[-106.52439,24.22717],[-106.51743,24.22478],[-106.51402,24.22826],[-106.51304,24.22536],[-106.51044,24.22394],[-106.50742,24.22924],[-106.50403,24.22936],[-106.5059,24.23116],[-106.50509,24.23284],[-106.50155,24.23238],[-106.49851,24.23491],[-106.49683,24.23461],[-106.4957,24.23582],[-106.49444,24.23509],[-106.49379,24.23702],[-106.49145,24.23839],[-106.48765,24.23755],[-106.48819,24.23908],[-106.48549,24.23824],[-106.48521,24.23998],[-106.46312,24.23804],[-106.46377,24.26852],[-106.46286,24.26971],[-106.5083,24.29087],[-106.46965,24.27786],[-106.42947,24.28507],[-106.40313,24.2931],[-106.36754,24.30194],[-106.3592,24.30747],[-106.35262,24.31647],[-106.34615,24.34493],[-106.3441,24.34881],[-106.33633,24.3557],[-106.32785,24.36106],[-106.26887,24.37476],[-106.19441,24.35179],[-106.17699,24.33886],[-106.17358,24.33633]]]}},{"type":"Feature","properties":{"name":"Sinaloa","cvegeo":"25017"},"geometry":{"type":"Polygon","coordinates":[[[-107.94981,26.35532],[-107.85626,26.22604],[-107.85402,26.19652],[-107.83995,26.18294],[-107.83713,26.18246],[-107.82656,26.18477],[-107.82402,26.18411],[-107.82382,26.18678],[-107.82275,26.18763],[-107.81825,26.18345],[-107.81524,26.18271],[-107.81028,26.18368],[-107.80454,26.1748],[-107.79625,26.17266],[-107.79302,26.16836],[-107.78892,26.16861],[-107.78069,26.13694],[-107.75517,26.13451],[-107.7494,26.14061],[-107.74792,26.14349],[-107.74866,26.14827],[-107.7476,26.15379],[-107.7452,26.15565],[-107.73956,26.15589],[-107.73787,26.15695],[-107.74007,26.16229],[-107.73872,26.16724],[-107.73523,26.16808],[-107.72489,26.16317],[-107.71743,26.16474],[-107.7146,26.16731],[-107.71326,26.17305],[-107.71108,26.17441],[-107.70826,26.17368],[-107.70614,26.17007],[-107.69919,26.17074],[-107.69738,26.16901],[-107.69632,26.16547],[-107.68726,26.16539],[-107.68085,26.16286],[-107.67941,26.1644],[-107.67681,26.16353],[-107.66895,26.16451],[-107.65972,26.16265],[-107.65276,26.16364],[-107.64682,26.15988],[-107.64608,26.15829],[-107.64227,26.15756],[-107.6407,26.15566],[-107.63575,26.15458],[-107.63198,26.15735],[-107.62524,26.1595],[-107.6243,26.16107],[-107.62262,26.16076],[-107.62077,26.16265],[-107.61314,26.16259],[-107.60717,26.16514],[-107.60539,26.16453],[-107.60335,26.16563],[-107.60182,26.16491],[-107.59318,26.16604],[-107.58976,26.1698],[-107.5823,26.17065],[-107.58109,26.17024],[-107.57941,26.16574],[-107.57753,26.1647],[-107.57494,26.16503],[-107.57028,26.16334],[-107.56539,26.16464],[-107.56078,26.16125],[-107.55568,26.15962],[-107.55396,26.15175],[-107.54794,26.14744],[-107.54328,26.14635],[-107.54021,26.14235],[-107.54,26.1408],[-107.54368,26.13732],[-107.53739,26.13766],[-107.53459,26.13094],[-107.52627,26.12775],[-107.52682,26.12246],[-107.52811,26.12138],[-107.52421,26.11317],[-107.52213,26.11182],[-107.52214,26.10855],[-107.52394,26.10723],[-107.52002,26.10423],[-107.52193,26.09145],[-107.52534,26.08655],[-107.52843,26.08535],[-107.52808,26.08112],[-107.52404,26.07873],[-107.51276,26.07934],[-107.51167,26.07748],[-107.51379,26.07368],[-107.51942,26.0682],[-107.52728,26.06708],[-107.53051,26.06327],[-107.53298,26.06327],[-107.53504,26.06192],[-107.53589,26.05987],[-107.54258,26.05722],[-107.5435,26.05239],[-107.54679,26.04928],[-107.54613,26.04616],[-107.53875,26.04894],[-107.53671,26.04765],[-107.53568,26.04125],[-107.52822,26.04199],[-107.52407,26.03902],[-107.51844,26.04155],[-107.5156,26.04004],[-107.51744,26.03037],[-107.51018,26.02538],[-107.50656,26.01953],[-107.49737,26.01797],[-107.49557,26.01485],[-107.4956,26.00974],[-107.4913,26.00504],[-107.48994,25.99975],[-107.50941,25.97979],[-107.53384,25.98129],[-107.60415,25.94295],[-107.59688,25.88997],[-107.60451,25.84028],[-107.64652,25.8123],[-107.69896,25.79515],[-107.68803,25.78958],[-107.68316,25.78451],[-107.67728,25.78258],[-107.68616,25.77473],[-107.68941,25.7735],[-107.69621,25.77436],[-107.69875,25.77322],[-107.71312,25.77246],[-107.71598,25.77042],[-107.71854,25.76178],[-107.72016,25.75946],[-107.7219,25.75865],[-107.72761,25.75935],[-107.73167,25.76099],[-107.73164,25.75581],[-107.7562,25.75023],[-107.75868,25.75326],[-107.76448,25.7517],[-107.76903,25.75345],[-107.77197,25.75241],[-107.77411,25.75015],[-107.77865,25.755],[-107.78338,25.75737],[-107.78664,25.75675],[-107.78914,25.75914],[-107.79097,25.75946],[-107.79262,25.75669],[-107.7944,25.75668],[-107.7925,25.75416],[-107.79294,25.75324],[-107.79769,25.7494],[-107.80139,25.74885],[-107.8016,25.74603],[-107.79851,25.73947],[-107.79731,25.73947],[-107.79779,25.73666],[-107.79512,25.73137],[-107.79532,25.73018],[-107.79718,25.73049],[-107.79874,25.72886],[-107.79929,25.72623],[-107.82581,25.73681],[-107.82921,25.73522],[-107.83534,25.7356],[-107.83892,25.72984],[-107.83777,25.72297],[-107.84007,25.72217],[-107.84085,25.72038],[-107.84235,25.72028],[-107.84346,25.71863],[-107.85755,25.71437],[-107.85369,25.69909],[-107.86414,25.69958],[-107.86611,25.6887],[-107.88454,25.68668],[-107.89962,25.67913],[-107.91466,25.66711],[-107.95384,25.6917],[-107.95784,25.68924],[-107.95748,25.68266],[-107.95002,25.66594],[-107.95711,25.66141],[-107.95628,25.65985],[-107.9614,25.65745],[-107.96261,25.65398],[-107.96679,25.65395],[-107.9688,25.65218],[-107.97212,25.65134],[-107.98438,25.6495],[-107.9844,25.64781],[-107.99082,25.65115],[-107.99446,25.63932],[-108.00379,25.63931],[-108.01718,25.64878],[-108.02716,25.65058],[-108.02868,25.64544],[-108.03444,25.63925],[-108.03684,25.63161],[-108.03677,25.62523],[-108.03925,25.61868],[-108.04676,25.60907],[-108.04768,25.60225],[-108.0468,25.60142],[-108.04876,25.59867],[-108.0472,25.59631],[-108.04826,25.59178],[-108.0548,25.58908],[-108.05563,25.59091],[-108.05747,25.58915],[-108.05934,25.58974],[-108.06077,25.58843],[-108.06849,25.59292],[-108.07127,25.5905],[-108.08431,25.59984],[-108.08358,25.60108],[-108.08761,25.60174],[-108.09313,25.60447],[-108.09371,25.59406],[-108.1177,25.5858],[-108.1186,25.60527],[-108.12041,25.60667],[-108.12406,25.60665],[-108.12428,25.60512],[-108.12535,25.60504],[-108.15812,25.60407],[-108.15868,25.60697],[-108.16347,25.60695],[-108.16355,25.60395],[-108.16733,25.60402],[-108.17215,25.60897],[-108.17411,25.60786],[-108.18053,25.61368],[-108.17864,25.61612],[-108.19434,25.63328],[-108.2194,25.63794],[-108.22065,25.63894],[-108.25121,25.64376],[-108.26215,25.65381],[-108.29845,25.66049],[-108.29768,25.6643],[-108.30981,25.67012],[-108.30649,25.67442],[-108.30382,25.67299],[-108.30183,25.67613],[-108.30743,25.67929],[-108.30687,25.68189],[-108.30967,25.68431],[-108.3119,25.68276],[-108.31201,25.69379],[-108.31364,25.69545],[-108.31273,25.69599],[-108.31359,25.69801],[-108.3117,25.69969],[-108.30494,25.6931],[-108.29874,25.69833],[-108.2944,25.69751],[-108.29946,25.71135],[-108.29196,25.71706],[-108.30555,25.73191],[-108.31201,25.73747],[-108.31593,25.73835],[-108.32983,25.75033],[-108.32868,25.75213],[-108.33472,25.75727],[-108.33693,25.75635],[-108.33559,25.75317],[-108.33617,25.75075],[-108.33778,25.75147],[-108.3395,25.74593],[-108.34198,25.74244],[-108.34435,25.74142],[-108.34803,25.74388],[-108.34816,25.74765],[-108.34614,25.74942],[-108.34673,25.75273],[-108.34576,25.75434],[-108.34773,25.75482],[-108.34956,25.75017],[-108.35212,25.74798],[-108.35289,25.74842],[-108.35958,25.7422],[-108.35837,25.7412],[-108.35984,25.74003],[-108.35885,25.73936],[-108.36072,25.73487],[-108.36461,25.73357],[-108.36403,25.73571],[-108.36649,25.76437],[-108.39162,25.76768],[-108.41835,25.76844],[-108.41868,25.78342],[-108.42793,25.78702],[-108.42942,25.78668],[-108.43728,25.79059],[-108.44682,25.74361],[-108.45571,25.74325],[-108.45789,25.7368],[-108.47516,25.73605],[-108.47557,25.74236],[-108.48313,25.74206],[-108.48295,25.74364],[-108.49146,25.7425],[-108.49161,25.73292],[-108.53039,25.73989],[-108.53002,25.73024],[-108.54059,25.72991],[-108.54022,25.72149],[-108.5508,25.72134],[-108.55029,25.70976],[-108.55714,25.71189],[-108.55771,25.70913],[-108.56239,25.7094],[-108.56268,25.70539],[-108.65509,25.70575],[-108.65503,25.70056],[-108.66325,25.70756],[-108.67504,25.69786],[-108.68931,25.70513],[-108.68249,25.71554],[-108.69108,25.72007],[-108.68666,25.72686],[-108.70305,25.73583],[-108.7063,25.7416],[-108.7066,25.77074],[-108.70459,25.78313],[-108.71342,25.78851],[-108.71581,25.78829],[-108.72049,25.78541],[-108.72047,25.79152],[-108.73185,25.79162],[-108.737,25.80016],[-108.74836,25.81274],[-108.76088,25.83681],[-108.76481,25.85083],[-108.74033,25.85655],[-108.73841,25.85493],[-108.73042,25.86319],[-108.72428,25.86123],[-108.72489,25.85026],[-108.70661,25.84832],[-108.70494,25.84623],[-108.66747,25.85079],[-108.67091,25.87322],[-108.64991,25.88063],[-108.66431,25.89459],[-108.65712,25.91777],[-108.61503,25.92701],[-108.61395,25.97524],[-108.64785,25.97581],[-108.64512,25.99104],[-108.63298,26.02069],[-108.63179,26.03434],[-108.62859,26.02999],[-108.61601,26.05591],[-108.59979,26.0847],[-108.61702,26.10038],[-108.61432,26.10628],[-108.5859,26.10588],[-108.51582,26.0989],[-108.51348,26.11377],[-108.49743,26.11582],[-108.50434,26.14258],[-108.50349,26.14709],[-108.49776,26.14829],[-108.49236,26.14607],[-108.48778,26.13904],[-108.48484,26.14258],[-108.47765,26.12919],[-108.46548,26.15625],[-108.45535,26.15044],[-108.45261,26.14134],[-108.44776,26.14446],[-108.43953,26.1322],[-108.4437,26.12396],[-108.43046,26.11625],[-108.41521,26.11704],[-108.40821,26.13113],[-108.4153,26.14502],[-108.40407,26.15611],[-108.39777,26.16587],[-108.38128,26.16232],[-108.35439,26.20281],[-108.35772,26.21889],[-108.3199,26.22221],[-108.27559,26.24809],[-108.28534,26.26416],[-108.28256,26.26636],[-108.28175,26.26935],[-108.2774,26.27593],[-108.27321,26.27801],[-108.27968,26.29156],[-108.2819,26.29247],[-108.28266,26.29777],[-108.28601,26.29505],[-108.28511,26.3077],[-108.28095,26.30886],[-108.27906,26.3234],[-108.28457,26.34286],[-108.27221,26.36639],[-108.26262,26.36326],[-108.26259,26.38479],[-108.22055,26.37769],[-108.2145,26.364],[-108.20493,26.37402],[-108.18674,26.37366],[-108.19207,26.35983],[-108.19196,26.35646],[-108.19586,26.34948],[-108.19881,26.34854],[-108.202,26.33284],[-108.20584,26.32246],[-108.22046,26.32477],[-108.22117,26.32121],[-108.21911,26.3157],[-108.21891,26.31054],[-108.21714,26.30689],[-108.20743,26.30343],[-108.18881,26.29402],[-108.18145,26.29259],[-108.17587,26.29514],[-108.17294,26.28991],[-108.16566,26.28382],[-108.15489,26.28638],[-108.158,26.29516],[-108.15792,26.29736],[-108.15464,26.30233],[-108.14655,26.30037],[-108.14213,26.30111],[-108.1369,26.30005],[-108.131,26.30112],[-108.12801,26.29938],[-108.12307,26.30161],[-108.11938,26.29968],[-108.11546,26.29965],[-108.11147,26.29829],[-108.09772,26.31189],[-108.09221,26.31032],[-108.09002,26.31076],[-108.08538,26.30882],[-108.05312,26.31358],[-108.03926,26.33084],[-108.03088,26.33886],[-108.03661,26.3689],[-108.01391,26.39045],[-108.01939,26.44949],[-108.01434,26.45328],[-107.99937,26.44845],[-108.0128,26.43905],[-108.00059,26.42216],[-107.97303,26.39253],[-107.97378,26.38818],[-107.94981,26.35532]]]}},{"type":"Feature","properties":{"name":"Navolato","cvegeo":"25018"},"geometry":{"type":"Polygon","coordinates":[[[-107.8889,25.02063],[-107.84065,25.03215],[-107.82716,25.00762],[-107.8173,25.00447],[-107.80846,24.9796],[-107.79965,24.96635],[-107.79191,24.96303],[-107.79374,24.96221],[-107.79894,24.95443],[-107.79073,24.94951],[-107.78357,24.94982],[-107.78115,24.94567],[-107.77809,24.95159],[-107.77035,24.94832],[-107.76879,24.951],[-107.76652,24.95202],[-107.76576,24.94625],[-107.75826,24.94713],[-107.75787,24.94154],[-107.75673,24.9417],[-107.76019,24.93585],[-107.75154,24.93577],[-107.75158,24.93665],[-107.74462,24.93538],[-107.74444,24.93682],[-107.7362,24.92751],[-107.73677,24.92545],[-107.68263,24.88968],[-107.64734,24.87356],[-107.64854,24.87158],[-107.60994,24.85557],[-107.61252,24.83161],[-107.59875,24.83143],[-107.59768,24.8226],[-107.58529,24.82251],[-107.58535,24.81456],[-107.5969,24.81558],[-107.59799,24.80997],[-107.58425,24.80914],[-107.58558,24.8012],[-107.56596,24.80319],[-107.56246,24.80462],[-107.56237,24.79911],[-107.55347,24.80163],[-107.55225,24.79923],[-107.55318,24.79548],[-107.55259,24.78955],[-107.55131,24.78951],[-107.54897,24.78295],[-107.54521,24.78466],[-107.54003,24.77032],[-107.51738,24.77227],[-107.51726,24.77093],[-107.51332,24.77132],[-107.51321,24.76147],[-107.51233,24.76147],[-107.51236,24.76976],[-107.50848,24.77003],[-107.50848,24.77176],[-107.50645,24.77181],[-107.50463,24.76758],[-107.49005,24.76164],[-107.47776,24.75287],[-107.47704,24.7447],[-107.474,24.74456],[-107.47402,24.71374],[-107.47126,24.71308],[-107.47137,24.71111],[-107.46749,24.7112],[-107.46706,24.71276],[-107.45297,24.71018],[-107.45288,24.69752],[-107.46117,24.69759],[-107.46172,24.68342],[-107.46897,24.6834],[-107.4663,24.67215],[-107.50365,24.67177],[-107.51255,24.61951],[-107.51375,24.6178],[-107.51383,24.59012],[-107.52368,24.59016],[-107.52368,24.57231],[-107.53351,24.57229],[-107.53363,24.53982],[-107.5308,24.53759],[-107.52826,24.53361],[-107.52899,24.53194],[-107.53773,24.52594],[-107.53746,24.52208],[-107.54003,24.51746],[-107.53649,24.45596],[-107.61729,24.41734],[-107.80048,24.52603],[-107.82846,24.52148],[-107.83093,24.54032],[-107.83934,24.55118],[-107.84455,24.55529],[-107.87264,24.57001],[-107.88141,24.57881],[-107.90141,24.58692],[-107.95045,24.61567],[-107.98688,24.64143],[-108.00255,24.65636],[-108.01004,24.66656],[-108.01695,24.67884],[-108.01897,24.68537],[-108.0189,24.70371],[-108.01825,24.70854],[-108.01654,24.71232],[-108.01638,24.71969],[-108.01758,24.72574],[-108.02077,24.73239],[-108.03504,24.7505],[-108.04787,24.76274],[-108.06854,24.77739],[-108.0719,24.78029],[-108.07158,24.78185],[-108.06991,24.78514],[-108.03463,24.80789],[-108.02189,24.84238],[-108.00922,24.84517],[-108.00421,24.84994],[-108.00804,24.8654],[-108.02503,24.89338],[-108.02435,24.91382],[-108.00951,24.92264],[-107.99542,24.95005],[-107.9885,24.96735],[-107.98543,24.96952],[-107.98403,24.96885],[-107.9816,24.9703],[-107.9802,24.9754],[-107.97318,24.97823],[-107.97117,24.97452],[-107.97413,24.97386],[-107.97575,24.97127],[-107.97547,24.96979],[-107.97282,24.96975],[-107.96953,24.97181],[-107.96888,24.97053],[-107.9637,24.96841],[-107.96778,24.97652],[-107.92428,24.97827],[-107.92008,24.97006],[-107.91523,24.96922],[-107.91497,24.9736],[-107.91367,24.97503],[-107.91367,24.98003],[-107.90947,24.97892],[-107.89952,25.01794],[-107.89448,25.03334],[-107.88441,25.03319],[-107.88839,25.02205],[-107.8889,25.02063]]]}}]};
/* GROWA · Atlas de inteligencia agrícola, edición institucional 2026.
 * Datos económicos: DGSIAP 2003–2025 en paquete existente. Cartografía: INEGI,
 * geometrías históricas simplificadas alojadas en /data (origen elbic).
 * Motor cartográfico: Leaflet (BSD-2-Clause), base OpenStreetMap / CARTO.
 * No se atribuye la cobertura satelital 2021 a cultivos concretos ni a 2025.
 */
(function(){
"use strict";
const $$=(e,s)=>e.querySelector(s);
const all=(e,s)=>Array.from(e.querySelectorAll(s));
const N=new Intl.NumberFormat("es-MX",{maximumFractionDigits:1});
const N0=new Intl.NumberFormat("es-MX",{maximumFractionDigits:0});
const sign=n=>n>0?"+":"";
const encode=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SLUG=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const YEARS=Array.from({length:23},(_,i)=>2025-i);
const PALETTE=["#edf3f0","#c8ded5","#8cb8a7","#477f70","#164b44"];
const DIVERGE=["#a34f56","#d6a1a2","#ecedef","#8ebbac","#277461"];
const region=[[-110.3,22.1],[-105.1,27.9]];
const state=Object.fromEntries(["territorio","cultivos"].map(kind=>[kind,{kind,year:2025,crop:kind==="cultivos"?"Maíz grano":"",metric:"value",layer:"municipal",focus:"",side:"focus",compA:"Culiacán",compB:"Guasave",showBorders:true,map:null,geo:null,selected:null,rows:[],byName:new Map(),max:0,initialized:false,tiles:null,base:null}]));
let D, GEO, initialized=false;
function recs(s,year=s.year,crop=s.crop){
 return (crop?D.crops:D.municipalities).filter(r=>r.year===year&&(!crop||r.name===crop));
}
function figure(s,year=s.year,crop=s.crop,metric=s.metric){
 const arr=recs(s,year,crop);
 const key=metric==="planted"?(crop?"planted":"area"):metric==="harvest"?"harvest":"value";
 const m=new Map();for(const r of arr){const k=crop?r.municipio:r.name;m.set(k,(m.get(k)||0)+(Number(r[key])||0));}
 if(metric==="growth"){
  const old=figure(s,year-1,crop,"value");
  const actual=figure(s,year,crop,"value");
  const growth=new Map();
  for(const [key,v] of actual)if(old.has(key)&&old.get(key)>0)growth.set(key,100*(v/old.get(key)-1));
  return growth;
 }
 return m;
}
const unit=m=>m==="value"?"MDP":m==="growth"?"%":"ha";
const fmt=(v,m)=>!Number.isFinite(v)?"Sin registro":(m==="growth"?(sign(v)+N.format(v)+" %"):N.format(v)+" "+unit(m));
function sourceFor(s){return s.crop?D.crops:D.municipalities;}
function distinctCount(s){return figure(s).size;}
function totalFor(s){return [...figure(s,""+s.year,s.crop,s.metric==="growth"?"value":s.metric).values()].reduce((a,b)=>a+b,0);}
function quantile(v,p){if(!v.length)return 0;const ix=(v.length-1)*p,lo=Math.floor(ix),hi=Math.ceil(ix);return v[lo]+(v[hi]-v[lo])*(ix-lo);}
function thresholds(map){const a=[...map.values()].filter(Number.isFinite).sort((x,y)=>x-y);return [0,.2,.4,.6,.8,1].map(p=>quantile(a,p));}
function scaleFor(s,val){
 if(val===undefined)return "#e8eae6";
 const lim=s.cut;
 if(s.metric==="growth"){if(val<0)return val<(-15)?DIVERGE[0]:DIVERGE[1];if(val>0)return val>15?DIVERGE[4]:DIVERGE[3];return DIVERGE[2];}
 let i=0;while(i<4&&val>lim[i+1])i++;return PALETTE[i];
}
function chartSVG(s,name){
 const years=YEARS.slice().reverse();
 const entries=years.map(y=>({y,v:figure(s,y).get(name)})).filter(r=>Number.isFinite(r.v));
 if(entries.length<2)return '<p class="ap-empty">No hay suficientes cierres comparables para construir una trayectoria.</p>';
 const yvals=entries.map(r=>r.v),vmin=Math.min(0,...yvals),vmax=Math.max(1,...yvals);
 const x=y=>24+(y-2003)/22*258,yy=v=>102-(v-vmin)/(vmax-vmin)*84;
 const d=entries.map((r,i)=>(i?"L":"M")+x(r.y).toFixed(2)+" "+yy(r.v).toFixed(2)).join(" ");
 const area=d+" L"+x(entries.at(-1).y)+" 105 L"+x(entries[0].y)+" 105 Z";
 return '<svg class="ap-spark" viewBox="0 0 305 133" role="img" aria-label="Evolución del indicador entre 2003 y 2025">'+
 '<path d="M20 105H288" fill="none" stroke="#e1e6e2" stroke-width="1"/>'+
 '<path d="'+area+'" fill="#d7e5df" fill-opacity=".78"/>'+
 '<path d="'+d+'" fill="none" stroke="#236457" stroke-width="2.25" stroke-linejoin="round"/>'+
 entries.map((r,i)=>i===0||i===entries.length-1?'<circle cx="'+x(r.y)+'" cy="'+yy(r.v)+'" r="3.3" fill="#236457" stroke="#fff" stroke-width="1.7"/>':'').join("")+
 '<text x="20" y="126">2003</text><text x="286" y="126" text-anchor="end">2025</text>'+
 '<text x="286" y="12" text-anchor="end">'+encode(fmt(vmax,s.metric))+'</text></svg>';
}
function moduleHTML(s){
 const title=s.kind==="territorio"?"Explorador territorial":"Geografía de la producción";
 const sub=s.kind==="territorio"?"Distribución municipal, especialización y transformaciones agrícolas.":"Localización económica de los cultivos, superficie y evolución entre municipios.";
 return '<div class="ap-section">'+
 '<div class="ap-titlebar"><div><div class="ap-overline">GROWA / INTELIGENCIA AGRÍCOLA <span>—</span> ATLAS 01</div><h3>'+title+'</h3><p>'+sub+'</p></div><div class="ap-head-tools"><span class="ap-data-state"><i></i> SERIE VALIDADA DGSIAP</span><button type="button" data-ap-details="true">Análisis completo <span aria-hidden="true">↗</span></button></div></div>'+
 '<div class="ap-tabs" role="group" aria-label="Vistas del atlas"><button type="button" data-ap-tab="municipal" class="is-active" aria-pressed="true">01 <strong>Producción municipal</strong></button><button type="button" data-ap-tab="cover" aria-pressed="false">02 <strong>Cobertura del suelo</strong></button><span class="ap-tab-muted">APTITUD AGROECOLÓGICA <i>EN PREPARACIÓN</i></span></div>'+
 '<div class="ap-filters"><label><span>AÑO AGRÍCOLA</span><select data-ap-year></select></label><label class="ap-crop-select"><span>TIPO DE CULTIVO</span><select data-ap-crop></select></label><label><span>INDICADOR ECONÓMICO</span><select data-ap-metric><option value="value">Valor de producción</option><option value="harvest">Superficie cosechada</option><option value="planted">Superficie sembrada</option><option value="growth">Variación anual del valor (%)</option></select></label><button class="ap-export" type="button" data-ap-export aria-label="Descargar los datos de la consulta"><span aria-hidden="true">↓</span> Exportar CSV</button></div>'+
 '<div class="ap-stats"><div><span>ÁMBITO</span><strong>Sinaloa</strong><small>18 municipios históricos</small></div><div><span data-ap-kpi-label>VALOR TOTAL OBSERVADO</span><strong data-ap-total>—</strong><small data-ap-total-sub>Datos registrados</small></div><div><span>COBERTURA MUNICIPAL</span><strong data-ap-count>—</strong><small>Con registros en la selección</small></div><div><span>FUENTE ESTADÍSTICA</span><strong>DGSIAP</strong><small>Serie municipal 2003–2025</small></div></div>'+
 '<div class="ap-main"><div class="ap-map-col"><div class="ap-map-top"><div><div class="ap-overline">VISUALIZADOR GEOESTADÍSTICO</div><strong data-ap-map-heading>Valor bruto de producción · 2025</strong></div><div class="ap-map-actions"><button type="button" data-ap-reset title="Regresar al encuadre estatal">Encuadre estatal ⤢</button><button type="button" data-ap-borders aria-pressed="true" title="Mostrar u ocultar límites municipales">Límites: sí</button></div></div><div class="ap-map-frame"><div class="ap-map" data-ap-map role="application" aria-label="Mapa interactivo de los 18 municipios de Sinaloa"></div><div class="ap-map-corner"><span class="ap-map-dot"></span> SINALOA, MÉXICO <span>25° N / 107° O</span></div><div class="ap-cover-chip" data-ap-cover-chip hidden>ESA WORLDCOVER 2021 · RESOLUCIÓN 10 M</div></div><div class="ap-legend" data-ap-legend></div></div>'+
 '<aside class="ap-side"><div class="ap-side-tabs"><button data-ap-side="focus" type="button" class="is-active">Ficha</button><button data-ap-side="rank" type="button">Clasificación</button><button data-ap-side="compare" type="button">Comparar</button></div><div class="ap-side-content"><div class="ap-side-focus" data-ap-focus></div><div class="ap-side-ranking" data-ap-ranking hidden></div><div class="ap-side-comparison" data-ap-compare-panel hidden></div></div><div class="ap-side-bottom"><button type="button" data-ap-open-detail>Ver expediente territorial <span>↗</span></button></div></aside></div>'+
 '<div class="ap-extras"><div class="ap-extra"><strong><span>01.</span> Geometría municipal</strong><p>18 municipios históricos, límites generalizados derivados de datos geoestadísticos. No refleja necesariamente la delimitación de municipios nuevos.</p></div><div class="ap-extra"><strong><span>02.</span> Evidencia productiva</strong><p>Valores DGSIAP en pesos corrientes. Las hectáreas sumadas por ciclos agrícolas no corresponden necesariamente a parcelas únicas.</p></div><div class="ap-extra"><strong><span>03.</span> Aptitud potencial</strong><p>FAO GAEZ evalúa aptitud biofísica; los rásteres de aptitud aún no se han incorporado. <a href="https://www.fao.org/gaez/en" target="_blank" rel="noopener">Consultar GAEZ ↗</a></p></div></div>'+
 '<div class="ap-bottom-line"><span>GROWA RESEARCH / OBSERVATORIO AGRÍCOLA</span><span>PRODUCCIÓN MUNICIPAL ≠ COBERTURA AGRÍCOLA ≠ APTITUD FUTURA</span></div>'+
 '</div>';
}
function populate(s){
 const root=s.root;
 $$(root,"[data-ap-year]").innerHTML=YEARS.map(y=>'<option value="'+y+'">'+y+'</option>').join("");
 const allCrops=D.crops.filter(r=>r.year===2025),top=new Map();
 allCrops.forEach(r=>top.set(r.name,(top.get(r.name)||0)+r.value));
 const sorted=D.cropNames.slice().sort((a,b)=>(top.get(b)||0)-(top.get(a)||0)||a.localeCompare(b,"es"));
 $$(root,"[data-ap-crop]").innerHTML='<option value="">Todos los cultivos</option>'+sorted.map(v=>'<option value="'+encode(v)+'">'+encode(v)+'</option>').join("");
 $$(root,"[data-ap-year]").value=s.year;
 $$(root,"[data-ap-crop]").value=s.crop;
}
function bind(s){
 const root=s.root;
 for(const [selector,key] of [["[data-ap-year]","year"],["[data-ap-crop]","crop"],["[data-ap-metric]","metric"]]){
  $$(root,selector).addEventListener("change",e=>{s[key]=key==="year"?+e.target.value:e.target.value;if(key==="crop")s.focus="";render(s);});
 }
 all(root,"[data-ap-tab]").forEach(b=>b.addEventListener("click",()=>{s.layer=b.dataset.apTab;render(s);}));
 all(root,"[data-ap-side]").forEach(b=>b.addEventListener("click",()=>{s.side=b.dataset.apSide;paintSide(s);}));
 $$(root,"[data-ap-reset]").addEventListener("click",()=>{if(s.map&&s.geo)s.map.fitBounds(s.geo.getBounds().pad(.055),{padding:[25,25],animate:true});});
 $$(root,"[data-ap-borders]").addEventListener("click",e=>{s.showBorders=!s.showBorders;e.currentTarget.textContent="Límites: "+(s.showBorders?"sí":"no");e.currentTarget.setAttribute("aria-pressed",String(s.showBorders));styleFeatures(s);});
 $$(root,"[data-ap-export]").addEventListener("click",()=>download(s));
 $(root,"[data-ap-ranking]").addEventListener("click",e=>{
  const b=e.target.closest("[data-ap-select]");if(b)select(s,b.dataset.apSelect,true);
 });
 $(root,"[data-ap-compare-panel]").addEventListener("change",e=>{
  if(e.target.dataset.apComparison==="a")s.compA=e.target.value;
  if(e.target.dataset.apComparison==="b")s.compB=e.target.value;
  paintSide(s);
 });
 $(root,"[data-ap-compare-panel]").addEventListener("click",e=>{
  if(e.target.closest("[data-ap-switch]")){const tmp=s.compA;s.compA=s.compB;s.compB=tmp;paintSide(s);}
 });
 $$(root,"[data-ap-details]").addEventListener("click",()=>openDetail(s));
 $$(root,"[data-ap-open-detail]").addEventListener("click",()=>openDetail(s));
}
function download(s){
 const cur=figure(s),prior=figure(s,s.year-1,s.crop,s.metric==="growth"?"value":s.metric),payload=[...cur].sort((a,b)=>b[1]-a[1]).map(([municipio,indicador])=>({
  municipio,anio:s.year,cultivo:s.crop||"Todos los cultivos",indicador:s.metric,valor:+indicador.toFixed(6),
  unidad:unit(s.metric),valor_prev_anio:prior.get(municipio)??"",
  fuente:"DGSIAP / elaboración Growa",cobertura:"Municipio, no parcela"
 }));
 if(window.GrowaDownloadCSV)window.GrowaDownloadCSV("growa_atlas_"+s.kind+"_"+s.year+".csv",payload);
 else {
  const columns=Object.keys(payload[0]||{}),escape=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
  const content=[columns.join(","),...payload.map(r=>columns.map(k=>escape(r[k])).join(","))].join("\r\n");
  const a=document.createElement("a"),url=URL.createObjectURL(new Blob(["\uFEFF"+content],{type:"text/csv;charset=utf-8"}));
  a.href=url;a.download="growa_atlas_"+s.kind+"_"+s.year+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
}
function openDetail(s){
 s.root.closest(".gx-page")?.classList.add("atlas-deep-open");
 const section=s.root.closest(".gx-page");
 if(s.kind==="territorio"&&window.GrowaExplorer){
  window.GrowaExplorer.openState("Sinaloa",s.focus||undefined);
 }else if(window.GrowaExplorer){
  window.GrowaExplorer.openCrop("sinaloa",s.crop||"Maíz grano");
 }
 if(section){const w=$$(section,".gx-workspace");if(w){w.scrollIntoView({behavior:"smooth",block:"start"});}}
}
function makeMap(s){
 if(!window.L){$$(s.root,"[data-ap-map]").textContent="El motor cartográfico Leaflet no está disponible.";return;}
 s.map=L.map($$(s.root,"[data-ap-map]"),{zoomControl:false,preferCanvas:true,scrollWheelZoom:false,attributionControl:true,minZoom:6,maxZoom:15});
 L.control.zoom({position:"bottomleft"}).addTo(s.map);
 s.base=L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{subdomains:"abcd",maxZoom:19,attribution:"© OpenStreetMap contributors · © CARTO"}).addTo(s.map);
 s.map.fitBounds([[22.35,-110.18],[27.18,-105.35]],{padding:[8,8]});
 s.map.createPane("apCover");s.map.getPane("apCover").style.zIndex="380";s.map.getPane("apCover").style.pointerEvents="none";
 s.cover=L.tileLayer.wms("https://mapproxy.terrascope.be/mapproxy/service",{
  layers:"esa-worldcover-map-10m-2021-v2_map",format:"image/png",version:"1.1.1",transparent:true,
  opacity:.60,pane:"apCover",attribution:"© ESA WorldCover 2021 / Contains modified Copernicus Sentinel data (2021)"
 });
 s.cover.on("tileerror",()=>{if(s.layer==="cover"){$$(s.root,"[data-ap-cover-chip]").textContent="Servicio ESA temporalmente no disponible";}});
 Promise.resolve(window.GrowaMunicipalGeometry).then(j=>{
  if(j.type!=="FeatureCollection"||j.features.length!==18)throw Error("Geometría fuera del contrato de 18 municipios");
  const names=new Set(j.features.map(f=>f.properties.name));
  for(const n of D.muniNames)if(!names.has(n))throw Error("Municipio sin geometría: "+n);
  s.geo=L.geoJSON(j,{style:f=>featureStyle(s,f.properties.name),onEachFeature:(f,layer)=>{
   const name=f.properties.name;
   layer.on("mouseover",()=>{if(s.showBorders)layer.setStyle({weight:2,color:"#1f3d35"});});
   layer.on("mouseout",()=>styleFeatures(s));
   layer.on("click",()=>select(s,name,false));
   layer.bindTooltip(()=>tooltip(s,name),{sticky:true,direction:"top",opacity:.98,className:"ap-map-tooltip"});
  }}).addTo(s.map);
  s.polygons=new Map();
  s.geo.eachLayer(l=>s.polygons.set(l.feature.properties.name,l));
  s.map.fitBounds(s.geo.getBounds().pad(.035),{padding:[20,20]});
  if(!s.focus||!s.polygons.has(s.focus))s.focus=s.kind==="territorio"?"Culiacán":"Culiacán";
  render(s);
 }).catch(error=>{
  console.error("GROWA/Atlas: límites",error);
  $$(s.root,"[data-ap-map]").setAttribute("data-map-issue","true");
  $$(s.root,"[data-ap-legend]").innerHTML="<strong>Cartografía municipal no disponible.</strong> Se conservan los indicadores DGSIAP y la consulta tabular.";
 });
}
function featureStyle(s,name){
 const val=s.byName.get(name);return {
  color:s.showBorders?(s.focus===name?"#153b34":"#fff"):"transparent",weight:s.showBorders?(s.focus===name?2.8:1.25):0,
  fillColor:s.layer==="cover"?"#e2e7e0":scaleFor(s,val),fillOpacity:s.layer==="cover"?.08:s.focus===name?.86:.76
 };
}
function tooltip(s,name){
 const val=s.byName.get(name);
 return '<span class="ap-tooltip-name">'+encode(name)+'</span><span class="ap-tooltip-value">'+encode(fmt(val,s.metric))+'</span><span class="ap-tooltip-detail">'+encode(s.crop||"Todos los cultivos")+' / '+s.year+'</span>';
}
function styleFeatures(s){
 if(!s.polygons)return;
 for(const [name,lyr] of s.polygons)lyr.setStyle(featureStyle(s,name));
}
function select(s,name,fly){
 if(!s.polygons?.has(name))return;
 if(s.side==="compare"){s.compB=name;}else{s.focus=name;s.side="focus";}
 paintSide(s);styleFeatures(s);
 if(fly)s.map.flyToBounds(s.polygons.get(name).getBounds(),{padding:[50,50],maxZoom:9.25,duration:.65});
}
function legend(s){
 if(s.layer==="cover"){
  return '<div class="ap-legend-desc"><span class="ap-legend-dot" style="background:#f096ff"></span><strong>Terreno agrícola</strong> · clase 40 en ESA WorldCover 2021. <span class="ap-legend-sub">Mapa completo de coberturas: el color violeta corresponde a cultivos; otros colores representan vegetación, agua, ciudades y otras clases.</span></div><a target="_blank" rel="noopener" href="https://esa-worldcover.org/en/data-access">Metadatos ↗</a>';
 }
 if(s.metric==="growth"){
  const labels=["≤ −15 %","−15 a 0 %","0 %","0 a 15 %","≥ 15 %"];
  return '<span class="ap-legend-title">Variación nominal interanual</span><div class="ap-legend-swatches">'+DIVERGE.map((c,i)=>'<div><i style="background:'+c+'"></i><span>'+labels[i]+'</span></div>').join("")+'</div><span class="ap-legend-units">Porcentaje</span>';
 }
 const breaks=s.cut||[];
 return '<span class="ap-legend-title">Escala municipal · '+encode(unit(s.metric))+'</span><div class="ap-legend-swatches">'+PALETTE.map((c,i)=>'<div><i style="background:'+c+'"></i><span>'+N.format(breaks[i]??0)+'–'+N.format(breaks[i+1]??0)+'</span></div>').join("")+'</div><span class="ap-legend-units">Quintiles observados</span>';
}
function setTiles(s){
 const visible=s.layer==="cover";
 if(visible&&!s.map.hasLayer(s.cover))s.cover.addTo(s.map);
 if(!visible&&s.map.hasLayer(s.cover))s.map.removeLayer(s.cover);
 const chip=$$(s.root,"[data-ap-cover-chip]");chip.hidden=!visible;
 if(visible)chip.textContent="ESA WORLDCOVER 2021 · 10 METROS · TODAS LAS CLASES";
 all(s.root,"[data-ap-tab]").forEach(b=>{
  const active=b.dataset.apTab===s.layer;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));
 });
}
function trendMetric(s,territory){
 const annual=YEARS.slice().reverse().map(y=>({year:y,v:figure(s,y,s.crop,s.metric==="growth"?"value":s.metric).get(territory)}));
 const observed=annual.filter(v=>Number.isFinite(v.v));
 const previous=annual.find(r=>r.year===s.year-1)?.v,current=annual.find(r=>r.year===s.year)?.v;
 const diff=Number.isFinite(previous)&&previous!==0&&Number.isFinite(current)?100*(current/previous-1):null;
 return {count:observed.length,change:diff};
}

function comparisonSVG(s,a,b){
 const metric=s.metric==="growth"?"value":s.metric,years=YEARS.slice().reverse();
 const line=name=>years.map(y=>({year:y,value:figure(s,y,s.crop,metric).get(name)})).filter(r=>Number.isFinite(r.value));
 const sa=line(a),sb=line(b),both=[...sa,...sb].map(r=>r.value);
 if(both.length<2)return '<p class="ap-empty">No hay cierres suficientes para esta comparación.</p>';
 const low=Math.min(0,...both),high=Math.max(1,...both);
 const x=y=>18+(y-2003)/22*272,yy=v=>99-((v-low)/(high-low))*81;
 const path=rows=>rows.map((r,i)=>(i?'L':'M')+x(r.year).toFixed(1)+' '+yy(r.value).toFixed(1)).join(' ');
 return '<svg class="ap-compare-svg" viewBox="0 0 307 126" role="img" aria-label="Dos trayectorias de la serie municipal 2003–2025">'+
 '<path d="M16 102 H290" stroke="#e3e9e4" stroke-width="1" fill="none"/>'+
 '<path d="'+path(sa)+'" fill="none" stroke="#2b7862" stroke-width="2.2" stroke-linecap="round"/>'+
 '<path d="'+path(sb)+'" fill="none" stroke="#bd885d" stroke-width="2.2" stroke-linecap="round"/>'+
 '<text x="18" y="120">2003</text><text x="290" y="120" text-anchor="end">2025</text></svg>';
}
function paintComparison(s){
 const panel=$(s.root,"[data-ap-compare-panel]");
 const names=D.muniNames;
 if(!names.includes(s.compA))s.compA=names[0];
 if(!names.includes(s.compB))s.compB=names[1];
 const selector=(k,current)=>'<label>'+ (k==="a"?"MUNICIPIO A":"MUNICIPIO B")+
 '<select data-ap-comparison="'+k+'">'+names.map(name=>'<option value="'+encode(name)+'"'+(name===current?' selected':'')+'>'+encode(name)+'</option>').join('')+'</select></label>';
 const av=s.byName.get(s.compA),bv=s.byName.get(s.compB);
 const delta=Number.isFinite(av)&&Number.isFinite(bv)?av-bv:null;
 panel.innerHTML='<div class="ap-compare-head"><div class="ap-overline">COMPARACIÓN DIRECTA</div><h4>Dos territorios,<br>una misma escala.</h4><p>Contraste reproducible de municipios con el mismo indicador, cultivo y año.</p></div>'+
 '<div class="ap-compare-select">'+selector("a",s.compA)+'<button type="button" data-ap-switch aria-label="Intercambiar municipios">⇄</button>'+selector("b",s.compB)+'</div>'+
 '<div class="ap-compare-values"><div><i></i><span>'+encode(s.compA)+'</span><strong>'+encode(fmt(av,s.metric))+'</strong></div><div><i></i><span>'+encode(s.compB)+'</span><strong>'+encode(fmt(bv,s.metric))+'</strong></div></div>'+
 '<div class="ap-compare-gap"><span>DIFERENCIA (A MENOS B)</span><strong>'+encode(fmt(delta,s.metric))+'</strong></div>'+
 '<div class="ap-chart-head"><strong>Trayectorias comparadas</strong><span>2003—2025</span></div>'+
 comparisonSVG(s,s.compA,s.compB)+
 '<p class="ap-compare-foot">Comparación descriptiva. Los pesos son nominales y las superficies corresponden a registros por cultivo y ciclo; una divergencia no implica causalidad.</p>';
}
function paintSide(s){
 const focus=$(s.root,"[data-ap-focus]"),rank=$(s.root,"[data-ap-ranking]"),compare=$(s.root,"[data-ap-compare-panel]");
 const n=s.focus||s.rows[0]?.[0]||"";
 const val=s.byName.get(n),sum=s.metric==="growth"?null:[...s.byName.values()].reduce((t,v)=>t+v,0);
 const share=val!==undefined&&sum>0?100*val/sum:null;
 const trend=trendMetric(s,n);
 focus.innerHTML=
 '<div class="ap-panel-head"><div class="ap-overline">PERFIL TERRITORIAL / '+s.year+'</div><h4>'+encode(n||"Sin selección")+'</h4><p>'+encode(s.crop||"Producción agrícola total")+'</p></div>'+
 '<div class="ap-panel-value"><span>'+encode(s.metric==="growth"?"CAMBIO RESPECTO AL AÑO ANTERIOR":s.metric==="value"?"VALOR AGRÍCOLA NOMINAL":"SUPERFICIE REGISTRADA")+'</span><strong>'+fmt(val,s.metric)+'</strong></div>'+
 '<div class="ap-panel-facts"><div><span>PARTICIPACIÓN EN LA SELECCIÓN</span><strong>'+ (share===null?"—":N.format(share)+" %")+'</strong></div><div><span>VARIACIÓN INTERANUAL</span><strong class="'+(trend.change!==null&&trend.change<0?"ap-negative":"")+'">'+(trend.change===null?"—":sign(trend.change)+N.format(trend.change)+" %")+'</strong></div></div>'+
 '<div class="ap-chart-head"><strong>Serie histórica municipal</strong><span>2003—2025</span></div>'+
 chartSVG(s,n)+
 '<div class="ap-chart-foot">'+trend.count+' cierres disponibles. La gráfica representa el indicador elegido'+(s.metric==="growth"?" y para su trayectoria el valor base":"")+'.</div>';
 const max=Math.max(1,...s.rows.map(r=>s.metric==="growth"?Math.abs(r[1]):r[1]));
 rank.innerHTML='<div class="ap-rank-intro"><strong>Municipios por '+(s.metric==="growth"?"cambio anual":s.metric==="value"?"valor económico":"superficie")+'</strong><small>'+s.year+' · '+encode(s.crop||"Todos los cultivos")+'</small></div>'+
 s.rows.map(([name,v],i)=>'<button class="ap-rank-item'+(name===s.focus?" is-selected":"")+'" type="button" data-ap-select="'+encode(name)+'"><div><small>'+String(i+1).padStart(2,"0")+'</small><strong>'+encode(name)+'</strong><span>'+encode(fmt(v,s.metric))+'</span></div><i><b style="width:'+Math.min(100,Math.abs(v)/max*100).toFixed(1)+'%"></b></i></button>').join("");
 all(s.root,"[data-ap-side]").forEach(b=>b.classList.toggle("is-active",b.dataset.apSide===(s.side||"focus")));
 focus.hidden=(s.side||"focus")!=="focus";rank.hidden=(s.side||"focus")!=="rank";compare.hidden=(s.side||"focus")!=="compare";if(!compare.hidden)paintComparison(s);
 $$(s.root,"[data-ap-open-detail]").textContent=s.kind==="territorio"?"Abrir expediente municipal ↗":"Abrir análisis del cultivo ↗";
}
function render(s){
 if(!s.initialized)return;
 s.byName=figure(s);s.cut=thresholds(s.byName);
 s.rows=[...s.byName].filter(x=>Number.isFinite(x[1])).sort((a,b)=>b[1]-a[1]);
 const currentTotal=s.metric==="growth"?null:s.rows.reduce((t,r)=>t+r[1],0);
 $$(s.root,"[data-ap-total]").textContent=currentTotal===null?"Cambio anual":fmt(currentTotal,s.metric);
 $$(s.root,"[data-ap-kpi-label]").textContent=s.metric==="growth"?"LECTURA ACTIVA":"TOTAL DE LA SELECCIÓN";
 $$(s.root,"[data-ap-total-sub]").textContent=s.metric==="growth"?"Variación calculada por municipio":s.crop?encode(s.crop)+" · "+s.year:"Registro económico del cierre "+s.year;
 $$(s.root,"[data-ap-count]").textContent=s.rows.length+" / 18";
 $$(s.root,"[data-ap-map-heading]").textContent=(s.metric==="value"?"Valor bruto de producción":s.metric==="growth"?"Variación anual del valor":s.metric==="planted"?"Superficie sembrada":"Superficie cosechada")+" · "+s.year;
 if(s.rows.length&&!s.byName.has(s.focus))s.focus=s.rows[0][0];
 if(!s.rows.length)s.focus="";
 $$(s.root,"[data-ap-legend]").innerHTML=legend(s);
 setTiles(s);styleFeatures(s);paintSide(s);
 requestAnimationFrame(()=>s.map?.invalidateSize(false));
}
function create(s){
 s.root=document.querySelector('[data-pro-atlas="'+s.kind+'"]');
 if(!s.root)return;
 s.root.innerHTML=moduleHTML(s);
 populate(s);bind(s);s.initialized=true;
 makeMap(s);render(s);
}
function init(){
 if(initialized||!window.GrowaSinaloaData?.D)return;
 initialized=true;
 D=window.GrowaSinaloaData.D;
 create(state.territorio);create(state.cultivos);
 document.addEventListener("click",e=>{
  const target=e.target.closest(".navigation button, [data-tab], [data-gx-entity], [data-gx-crop]");
  if(target)requestAnimationFrame(()=>{Object.values(state).forEach(s=>s.map?.invalidateSize(false));});
 });
 window.addEventListener("resize",()=>Object.values(state).forEach(s=>s.map?.invalidateSize(false)));
 // Conserva los filtros del explorador detallado y del atlas como espacios independientes:
 // la fuente de datos siempre es la misma, sin mutar el paquete de investigación.
 window.GrowaAtlas=Object.freeze({getState:kind=>{const s=state[kind];return s?{year:s.year,crop:s.crop,metric:s.metric,layer:s.layer,focus:s.focus}:null;}});
}
window.addEventListener("growa:data-ready",init);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();


/* GROWA AGRICULTURA | NAVEGACION Y ESTADO V3 */
(function(){
  'use strict';
  function start(){
    var body=document.body;
    var button=document.querySelector('.ag-nav-toggle');
    var navigation=document.getElementById('ag-main-nav');
    var indicator=document.getElementById('ag-data-ready');
    if(!button||!navigation||!indicator)return;
    var mobileOpen=false;
    function closeMenu(){
      mobileOpen=false;
      body.classList.remove('ag-nav-open');
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-label','Abrir menú de navegación');
      button.querySelector('span').textContent='Menú';
    }
    button.addEventListener('click',function(){
      mobileOpen=!mobileOpen;
      body.classList.toggle('ag-nav-open',mobileOpen);
      button.setAttribute('aria-expanded',mobileOpen?'true':'false');
      button.setAttribute('aria-label',mobileOpen?'Cerrar menú de navegación':'Abrir menú de navegación');
      button.querySelector('span').textContent=mobileOpen?'Cerrar':'Menú';
    });
    navigation.addEventListener('click',function(event){
      if(event.target.closest('[data-tab]'))closeMenu();
    });
    document.addEventListener('click',function(event){
      if(mobileOpen&&!navigation.contains(event.target)&&!button.contains(event.target))closeMenu();
    });
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape'&&mobileOpen){closeMenu();button.focus();}
    });
    window.addEventListener('resize',function(){
      if(window.innerWidth>1060&&mobileOpen)closeMenu();
    },{passive:true});
    var currentView='';
    function syncNavigation(){
      var view=body.dataset.view||'panorama';
      if(currentView!==view){
        currentView=view;
        closeMenu();
        navigation.querySelectorAll('[data-tab]').forEach(function(node){
          if(node.dataset.tab===view)node.setAttribute('aria-current','page');
          else node.removeAttribute('aria-current');
        });
      }
    }
    var viewWatcher=new MutationObserver(syncNavigation);
    viewWatcher.observe(body,{attributes:true,attributeFilter:['data-view']});
    syncNavigation();
    function syncDataStatus(){
      var holder=window.GrowaSinaloaData;
      if(!holder||!holder.D)return false;
      var data=holder.D;
      if(!Array.isArray(data.state)||!Array.isArray(data.municipal2025))return false;
      var years=data.state.length;
      var municipalities=data.municipal2025.length;
      indicator.textContent='Base verificada: '+municipalities+' municipios · '+years+' cierres';
      indicator.dataset.ready='true';
      indicator.title='Integridad inicial del paquete validada al cargar el observatorio. No implica consulta en tiempo real al servidor de DGSIAP.';
      return true;
    }
    var ready=syncDataStatus();
    if(!ready){
      window.addEventListener('growa:data-ready',syncDataStatus,{once:true});
      var status=document.getElementById('status');
      if(status){
        var statusWatcher=new MutationObserver(function(){
          if(syncDataStatus()){statusWatcher.disconnect();return;}
          var message=status.textContent||'';
          if(/error|no se pudo|no coincide|no disponible|incompatible/i.test(message)){
            indicator.textContent='No se pudo verificar la base de datos';
            indicator.dataset.ready='error';
            statusWatcher.disconnect();
          }
        });
        statusWatcher.observe(status,{childList:true,characterData:true,subtree:true});
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();


/* GROWA AGRICULTURA | DATA CONSOLE V4 */
(function(){
  'use strict';
  const root=document.getElementById('agx-console');
  if(!root)return;
  const el=id=>document.getElementById(id);
  const num=new Intl.NumberFormat('es-MX',{maximumFractionDigits:1,minimumFractionDigits:0});
  const integer=new Intl.NumberFormat('es-MX',{maximumFractionDigits:0});
  const compact=new Intl.NumberFormat('es-MX',{notation:'compact',maximumFractionDigits:1});
  const pct=new Intl.NumberFormat('es-MX',{maximumFractionDigits:1,minimumFractionDigits:1});
  const escapeText=v=>String(v===null||v===undefined?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const metricInfo={
    value:{title:'Valor bruto de producción',unit:'millones de pesos nominales',short:'MDP',decimals:1},
    planted:{title:'Superficie sembrada',unit:'hectáreas acumuladas por cultivo y ciclo',short:'ha',decimals:0},
    harvest:{title:'Superficie cosechada',unit:'hectáreas acumuladas por cultivo y ciclo',short:'ha',decimals:0},
    loss:{title:'Superficie siniestrada',unit:'hectáreas acumuladas por cultivo y ciclo',short:'ha',decimals:0}
  };
  const all='__all__';
  const filter={muni:all,crop:all,metric:'value',year:2025,view:'chart',rank:'municipio'};
  let data=null,years=[],byYear=new Map(),lastRanking=[],lastSeries=[],initialized=false;
  const sum=(arr,key)=>arr.reduce((v,x)=>v+(Number(x[key])||0),0);
  const fmt=(v,metric=filter.metric)=>metric==='value'?num.format(v):integer.format(v);
  const size=v=>compact.format(v);
  const label=(v,metric=filter.metric)=>fmt(v,metric)+' '+metricInfo[metric].short;
  const isSelected=v=>v!==all;
  const selectedName=v=>isSelected(v)?v:'Todos';
  function listOptions(select,items,first){
    select.textContent='';
    const defaultOpt=document.createElement('option');
    defaultOpt.value=all;defaultOpt.textContent=first;select.append(defaultOpt);
    for(const name of items){
      const option=document.createElement('option');
      option.value=name;option.textContent=name;select.append(option);
    }
  }
  function loadPref(){
    const params=new URLSearchParams(location.search);
    const muni=params.get('agM'),crop=params.get('agC'),metric=params.get('agI'),year=Number(params.get('agY'));
    if(muni&&data.muniNames.includes(muni))filter.muni=muni;
    if(crop&&data.cropNames.includes(crop))filter.crop=crop;
    if(metric&&metricInfo[metric])filter.metric=metric;
    if(years.includes(year))filter.year=year;
    if(filter.muni!==all)filter.rank='cultivo';
  }
  function setUrl(){
    const u=new URL(location.href);
    [['agM',filter.muni],['agC',filter.crop],['agI',filter.metric],['agY',String(filter.year)]].forEach(([key,value])=>{
      if(value===all||key==='agI'&&value==='value'||key==='agY'&&value==='2025')u.searchParams.delete(key);
      else u.searchParams.set(key,value);
    });
    history.replaceState(null,'',u.pathname+(u.search||'')+(u.hash||''));
  }
  function filteredRows(year){
    const rows=byYear.get(year)||[];
    return rows.filter(r=>(filter.muni===all||r.municipio===filter.muni)&&(filter.crop===all||r.name===filter.crop));
  }
  function series(){
    return years.map(year=>{
      const rows=filteredRows(year);
      return {year,value:rows.length?sum(rows,filter.metric):null,records:rows.length};
    });
  }
  function activeRows(){return filteredRows(filter.year);}
  function growth(seriesRows){
    const i=seriesRows.findIndex(row=>row.year===filter.year);
    if(i<=0)return null;
    const a=seriesRows[i],b=seriesRows[i-1];
    return a.value!==null&&b.value!==null&&b.value!==0?100*(a.value/b.value-1):null;
  }
  function selectYear(year){
    if(!years.includes(year))return;
    filter.year=year;el('agx-year').value=String(year);setUrl();render();
  }
  function graph(seriesRows){
    const target=el('agx-plot');
    const valid=seriesRows.filter(p=>p.value!==null);
    if(!valid.length){
      target.innerHTML='<p class="agx-rank-empty">No existen observaciones en el periodo para esta combinación. La ausencia de registros no equivale a producción cero.</p>';
      return;
    }
    const box={left:63,right:869,top:31,bottom:279},w=box.right-box.left,h=box.bottom-box.top;
    const ymax=Math.max(1,...valid.map(x=>x.value))*1.13;
    const x=yr=>box.left+((yr-years[0])/(years[years.length-1]-years[0]))*w;
    const y=v=>box.bottom-(v/ymax)*h;
    const ticks=Array.from({length:5},(_,i)=>(ymax/4)*i);
    const axis=ticks.map(v=>'<line x1="'+box.left+'" y1="'+y(v).toFixed(1)+'" x2="'+box.right+'" y2="'+y(v).toFixed(1)+'" stroke="#e3e9e1" stroke-dasharray="'+(v===0?'0':'3 5')+'"/><text x="'+(box.left-13)+'" y="'+(y(v)+4).toFixed(1)+'" text-anchor="end" font-size="10" fill="#7b887a">'+escapeText(size(v))+'</text>').join('');
    let d='',lastExists=false;
    for(const row of seriesRows){
      if(row.value===null){lastExists=false;continue;}
      d+=(lastExists?' L':' M')+x(row.year).toFixed(2)+' '+y(row.value).toFixed(2);
      lastExists=true;
    }
    const active=seriesRows.find(row=>row.year===filter.year);
    const selX=x(filter.year);
    const yearTicks=years.filter((v,i)=>i===0||i===years.length-1||(v-2003)%4===0).map(yr=>'<text x="'+x(yr).toFixed(2)+'" y="314" text-anchor="middle" font-size="10.5" fill="#6d8171">'+yr+'</text>').join('');
    const hit=seriesRows.filter(r=>r.value!==null).map(r=>{
      const chosen=r.year===filter.year;
      return '<g data-agx-year="'+r.year+'" tabindex="0" role="button" aria-label="'+r.year+': '+escapeText(label(r.value))+'"><title>'+r.year+' · '+escapeText(label(r.value))+'</title><rect x="'+(x(r.year)-16).toFixed(2)+'" y="14" width="32" height="285" fill="transparent"/><circle cx="'+x(r.year).toFixed(2)+'" cy="'+y(r.value).toFixed(2)+'" r="'+(chosen?'6.5':'3.2')+'" stroke="'+(chosen?'#fff':'#337156')+'" stroke-width="'+(chosen?2:1)+'" fill="'+(chosen?'#284f38':'#337156')+'"/></g>';
    }).join('');
    const bubble=(active&&active.value!==null)?'<g><rect x="'+(selX>635?selX-152:selX+11).toFixed(2)+'" y="5" rx="0" width="141" height="39" fill="#274835"/><text x="'+(selX>635?selX-141:selX+22).toFixed(2)+'" y="22" font-size="10" fill="#d6e6d7">'+filter.year+'</text><text x="'+(selX>635?selX-141:selX+22).toFixed(2)+'" y="36" font-size="13" font-weight="700" fill="#fff">'+escapeText(label(active.value))+'</text></g>':'';
    target.innerHTML='<svg viewBox="0 0 900 337" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Serie histórica interactiva por año, 2003 a 2025"><text x="'+box.left+'" y="12" font-size="9" font-weight="700" fill="#67816b" letter-spacing="1.0">'+escapeText(metricInfo[filter.metric].short)+' / SERIE ANUAL</text>'+axis+'<line x1="'+selX.toFixed(2)+'" y1="'+box.top+'" x2="'+selX.toFixed(2)+'" y2="'+box.bottom+'" stroke="#8bb599" stroke-width="1.5" stroke-dasharray="4 5"/><path d="'+d+'" fill="none" stroke="#2f6748" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+hit+yearTicks+bubble+'</svg>';
  }
  function table(seriesRows){
    el('agx-series-table').innerHTML='<table aria-label="Serie histórica de la consulta"><thead><tr><th>Año</th><th>Registros</th><th>Variable seleccionada</th></tr></thead><tbody>'+seriesRows.map(row=>{
      const current=row.year===filter.year;
      return '<tr data-agx-row="'+row.year+'" tabindex="0" aria-selected="'+current+'"><td>'+row.year+'</td><td>'+integer.format(row.records)+'</td><td>'+(row.value===null?'Sin registro':escapeText(label(row.value)))+'</td></tr>';
    }).join('')+'</tbody></table>';
  }
  function groups(rows){
    const index=new Map(),key=filter.rank==='municipio'?'municipio':'name';
    for(const row of rows){
      const name=row[key],a=index.get(name)||{name,value:0,records:0};
      a.value+=Number(row[filter.metric])||0;a.records++;index.set(name,a);
    }
    return [...index.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name,'es'));
  }
  function ranking(rows){
    const ranked=groups(rows);
    lastRanking=ranked;
    const total=sum(ranked,'value');
    const max=Math.max(0,...ranked.map(r=>r.value));
    const area=el('agx-rank');
    if(!ranked.length){
      area.innerHTML='<p class="agx-rank-empty">No se encontraron datos para este corte. Modifique el municipio, cultivo o año.</p>';
    }else{
      area.innerHTML=ranked.map((r,i)=>{
        const weight=total>0?(100*r.value/total):0;
        const intensity=max>0?100*r.value/max:0;
        const filterName=filter.rank==='municipio'?'data-agx-municipio':'data-agx-cultivo';
        return '<button type="button" class="agx-rank-row" '+filterName+'="'+escapeText(r.name)+'" title="Filtrar por '+escapeText(r.name)+'"><span class="agx-rank-line"><span class="agx-rank-position">'+String(i+1).padStart(2,'0')+'</span><span class="agx-rank-name">'+escapeText(r.name)+'</span><strong class="agx-rank-value">'+escapeText(fmt(r.value))+'</strong></span><span class="agx-rank-track"><i style="width:'+Math.max(0,Math.min(100,intensity)).toFixed(2)+'%"></i></span><span class="agx-rank-sub">'+pct.format(weight)+' % de la selección</span></button>';
      }).join('');
    }
    el('agx-rank-count').textContent=integer.format(ranked.length)+' '+(filter.rank==='municipio'?'municipios':'cultivos');
    el('agx-rank-subtitle').textContent=filter.rank==='municipio'?'Contribución municipal · '+filter.year:'Composición por cultivo · '+filter.year;
    root.querySelectorAll('[data-agx-rank]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.agxRank===filter.rank)));
  }
  function insight(rows,current,ranked){
    const year=filter.year,place=filter.muni===all?'Sinaloa':filter.muni,what=filter.crop===all?'el conjunto de cultivos':filter.crop;
    if(!rows.length){
      el('agx-observation').textContent='No hay observaciones para '+what+' en '+place+' durante '+year+'. Un año sin registro no puede interpretarse como producción nula; ajuste el ámbito o el periodo.';
      return;
    }
    const val=current.value,metric=metricInfo[filter.metric];
    const top=ranked.slice(0,3),share=val>0?sum(top,'value')/val*100:null;
    const first=top[0];
    let txt='En '+year+', '+place+' registró '+label(val)+' de '+metric.title.toLowerCase()+' para '+what+'. ';
    if(first&&share!==null){
      txt+='En el desglose por '+(filter.rank==='municipio'?'municipio':'cultivo')+', '+first.name+' tuvo la mayor contribución; los tres primeros concentran '+pct.format(share)+' % del valor de esta variable. ';
    }
    txt+='Se trata de una lectura descriptiva; para comparar valor entre años en términos reales se requiere deflactar.';
    el('agx-observation').textContent=txt;
  }
  function render(){
    if(!data)return;
    const rows=activeRows();
    const s=series();
    lastSeries=s;
    const current=s.find(r=>r.year===filter.year);
    const inc=growth(s);
    const m=metricInfo[filter.metric];
    el('agx-query-label').textContent=(filter.muni===all?'Sinaloa':filter.muni)+' · '+(filter.crop===all?'Todos los cultivos':filter.crop)+' · '+filter.year;
    el('agx-query-meta').textContent=m.title+' · '+m.short;
    el('agx-total').textContent=current.value===null?'s/d':label(current.value);
    el('agx-total-foot').textContent=rows.length?integer.format(rows.length)+' registros municipio–cultivo en '+filter.year:'Sin registros en el corte';
    el('agx-growth').textContent=inc===null?'s/d':(inc>0?'+':'')+pct.format(inc)+' %';
    el('agx-growth-foot').textContent=inc===null?'Comparación anual no disponible':'Cambio frente al año inmediato anterior';
    el('agx-crops-count').textContent=integer.format(new Set(rows.map(row=>row.name)).size);
    el('agx-munis-count').textContent=integer.format(new Set(rows.map(row=>row.municipio)).size);
    el('agx-series-subtitle').textContent=metricInfo[filter.metric].title+' · 2003—2025';
    el('agx-chart-note').textContent=filter.metric==='value'?'Los valores nominales no están ajustados por inflación.':'La superficie es la suma de registros por cultivo y ciclo, no superficie física única.';
    el('agx-plot').hidden=filter.view!=='chart';
    el('agx-series-table').hidden=filter.view!=='table';
    root.querySelectorAll('[data-agx-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.agxView===filter.view)));
    graph(s);table(s);ranking(rows);insight(rows,current,lastRanking);
  }
  function makeCSV(filename,rows){
    if(!rows.length)return;
    const columns=Object.keys(rows[0]);
    const protect=v=>{
      const text=String(v===null||v===undefined?'':v);
      const safe=/^[=+\-@\t\r]/.test(text)?"'"+text:text;
      return '"'+safe.replace(/"/g,'""')+'"';
    };
    const lines=['\ufeff'+columns.map(protect).join(','),...rows.map(row=>columns.map(k=>protect(row[k])).join(','))];
    const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  function exportSeries(){
    makeCSV('GROWA_agricultura_serie_'+filter.year+'.csv',lastSeries.map(row=>({anio:row.year,municipio:selectedName(filter.muni),cultivo:selectedName(filter.crop),variable:metricInfo[filter.metric].title,valor:row.value===null?'':row.value,unidad:metricInfo[filter.metric].short,registros:row.records,fuente:'DGSIAP'})));
  }
  function exportRanking(){
    makeCSV('GROWA_agricultura_composicion_'+filter.year+'.csv',lastRanking.map((row,i)=>({posicion:i+1,dimension:filter.rank,territorio_o_cultivo:row.name,valor:row.value,unidad:metricInfo[filter.metric].short,anio:filter.year,registros:row.records,fuente:'DGSIAP'})));
  }
  function act(action){
    if(action==='reset'){
      Object.assign(filter,{muni:all,crop:all,metric:'value',year:2025,rank:'municipio',view:'chart'});
      el('agx-municipio').value=all;el('agx-cultivo').value=all;el('agx-metric').value='value';el('agx-year').value='2025';
      setUrl();render();return;
    }
    if(action==='export-series'){exportSeries();return;}
    if(action==='export-ranking'){exportRanking();return;}
    if(action==='share'){
      setUrl();
      const url=location.href;
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(()=>{
          const btn=root.querySelector('[data-agx-action="share"]');
          if(btn){btn.textContent='✓ Enlace copiado';setTimeout(()=>btn.textContent='↗ Compartir consulta',1800);}
        }).catch(()=>window.prompt('Copie el enlace de la consulta:',url));
      }else window.prompt('Copie el enlace de la consulta:',url);
    }
  }
  function init(){
    if(initialized)return;
    const provider=window.GrowaSinaloaData;
    if(!provider||!provider.D||!Array.isArray(provider.D.crops))return;
    data=provider.D;initialized=true;
    years=data.state.map(x=>x.year).sort((a,b)=>a-b);
    for(const year of years)byYear.set(year,[]);
    for(const row of data.crops)if(byYear.has(row.year))byYear.get(row.year).push(row);
    listOptions(el('agx-municipio'),data.muniNames,'Sinaloa · todos los municipios');
    listOptions(el('agx-cultivo'),data.cropNames,'Todos los cultivos');
    el('agx-year').innerHTML=years.slice().reverse().map(year=>'<option value="'+year+'">'+year+'</option>').join('');
    loadPref();
    el('agx-municipio').value=filter.muni;el('agx-cultivo').value=filter.crop;
    el('agx-metric').value=filter.metric;el('agx-year').value=String(filter.year);
    root.addEventListener('change',event=>{
      const t=event.target;
      if(t.id==='agx-municipio'){filter.muni=t.value;if(filter.muni!==all)filter.rank='cultivo';else if(filter.crop===all)filter.rank='municipio';}
      else if(t.id==='agx-cultivo'){filter.crop=t.value;if(filter.crop!==all)filter.rank='municipio';}
      else if(t.id==='agx-metric')filter.metric=t.value;
      else if(t.id==='agx-year')filter.year=Number(t.value);
      else return;
      setUrl();render();
    });
    root.addEventListener('click',event=>{
      const y=event.target.closest('[data-agx-year],[data-agx-row]');
      if(y){selectYear(Number(y.dataset.agxYear||y.dataset.agxRow));return;}
      const action=event.target.closest('[data-agx-action]');
      if(action){act(action.dataset.agxAction);return;}
      const view=event.target.closest('[data-agx-view]');
      if(view){filter.view=view.dataset.agxView;render();return;}
      const rank=event.target.closest('[data-agx-rank]');
      if(rank){filter.rank=rank.dataset.agxRank;render();return;}
      const muni=event.target.closest('[data-agx-municipio]');
      if(muni){filter.muni=muni.dataset.agxMunicipio;filter.rank='cultivo';el('agx-municipio').value=filter.muni;setUrl();render();return;}
      const crop=event.target.closest('[data-agx-cultivo]');
      if(crop){filter.crop=crop.dataset.agxCultivo;filter.rank='municipio';el('agx-cultivo').value=filter.crop;setUrl();render();return;}
    });
    root.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      const target=event.target.closest('[data-agx-year],[data-agx-row]');
      if(target){event.preventDefault();selectYear(Number(target.dataset.agxYear||target.dataset.agxRow));}
    });
    render();
  }
  window.addEventListener('growa:data-ready',init);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();


/* GROWA AGRICULTURA | REGISTRO TABULAR V5 */
(function(){
 'use strict';
 const scope=document.getElementById('agx-console');
 if(!scope)return;
 const byId=id=>document.getElementById(id);
 const fmt=new Intl.NumberFormat('es-MX',{maximumFractionDigits:1,minimumFractionDigits:0});
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-MX');
 const esc=s=>String(s===null||s===undefined?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let data=null,allRows=[],rows=[],sortKey='value',page=0,search='',lastKey='',ready=false;
 const pageSize=25;
 const safeNumber=v=>Number.isFinite(Number(v))?Number(v):0;
 function key(){
   return [byId('agx-municipio').value,byId('agx-cultivo').value,byId('agx-year').value,search,sortKey].join('|');
 }
 function sourceRows(){
   const mun=byId('agx-municipio').value,crop=byId('agx-cultivo').value,year=Number(byId('agx-year').value);
   return allRows.filter(r=>r.year===year&&(mun==='__all__'||r.municipio===mun)&&(crop==='__all__'||r.name===crop)&&(!search||norm(r.municipio+' '+r.name).includes(norm(search))));
 }
 function refresh(reset){
   if(!ready)return;
   const now=key();
   if(!reset&&now===lastKey)return;
   if(reset)page=0;
   lastKey=now;
   rows=sourceRows();
   const numeric=['value','planted','harvest','loss','volume'];
   if(numeric.includes(sortKey))rows.sort((a,b)=>safeNumber(b[sortKey])-safeNumber(a[sortKey])||a.municipio.localeCompare(b.municipio,'es'));
   else rows.sort((a,b)=>String(a[sortKey]||'').localeCompare(String(b[sortKey]||''),'es')||b.value-a.value);
   paint();
 }
 function paint(){
   const count=rows.length,pages=Math.max(1,Math.ceil(count/pageSize));page=Math.min(page,pages-1);
   byId('ag5-table-counter').textContent=fmt.format(count)+' registros';
   const from=page*pageSize,subset=rows.slice(from,from+pageSize);
   byId('ag5-records-body').innerHTML=subset.length?subset.map(r=>(
     '<tr><td title="'+esc(r.municipio)+'">'+esc(r.municipio)+'</td>'+
     '<td title="'+esc(r.name)+'">'+esc(r.name)+'</td>'+
     '<td class="ag5-num">'+fmt.format(safeNumber(r.value))+'</td>'+
     '<td class="ag5-num">'+fmt.format(safeNumber(r.planted))+'</td>'+
     '<td class="ag5-num">'+fmt.format(safeNumber(r.harvest))+'</td>'+
     '<td class="ag5-num">'+fmt.format(safeNumber(r.loss))+'</td>'+
     '<td class="ag5-num">'+fmt.format(safeNumber(r.volume))+'</td>'+
     '<td>'+esc(r.unit||'No especificada')+'</td></tr>'
   )).join(''):'<tr><td colspan="8" class="ag5-no-data">No hay registros para esta selección. Cambie el filtro o la búsqueda. La ausencia de observaciones no indica valor cero.</td></tr>';
   byId('ag5-page-label').textContent=count?fmt.format(from+1)+'–'+fmt.format(Math.min(from+pageSize,count))+' de '+fmt.format(count):'0 resultados';
   byId('ag5-prev').disabled=page===0;
   byId('ag5-next').disabled=page>=pages-1;
 }
 function download(){
   if(!rows.length)return;
   const columns=[
    ['Año','year'],['Municipio','municipio'],['Cultivo','name'],
    ['Valor de producción (MDP nominales)','value'],
    ['Superficie sembrada (ha)','planted'],['Superficie cosechada (ha)','harvest'],
    ['Superficie siniestrada (ha)','loss'],['Volumen de producción','volume'],['Unidad del volumen','unit']
   ];
   function cell(value){
     let v=String(value===null||value===undefined?'':value);
     if(/^[=+\-@\t\r]/.test(v))v="'"+v;
     return '"'+v.replace(/"/g,'""')+'"';
   }
   const content='\ufeff'+columns.map(c=>cell(c[0])).join(',')+'\r\n'+rows.map(r=>columns.map(([h,k])=>cell(r[k])).join(',')).join('\r\n');
   const u=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
   const a=document.createElement('a');a.href=u;a.download='GROWA_agricultura_registros_'+byId('agx-year').value+'.csv';
   document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);
 }
 function start(){
   if(ready)return;
   const source=window.GrowaSinaloaData?.D;
   if(!source||!Array.isArray(source.crops))return;
   data=source;allRows=source.crops;ready=true;
   byId('ag5-source-state').textContent='Integridad: '+fmt.format(allRows.length)+' registros históricos';
   let debounce;
   byId('ag5-search').addEventListener('input',e=>{
     search=e.target.value.trim();clearTimeout(debounce);debounce=setTimeout(()=>refresh(true),140);
   });
   byId('ag5-sort').addEventListener('change',e=>{sortKey=e.target.value;refresh(true);});
   byId('ag5-prev').addEventListener('click',()=>{if(page>0){page--;paint();}});
   byId('ag5-next').addEventListener('click',()=>{if((page+1)*pageSize<rows.length){page++;paint();}});
   byId('ag5-export').addEventListener('click',download);
   ['agx-municipio','agx-cultivo','agx-year'].forEach(id=>byId(id).addEventListener('change',()=>refresh(true)));
   // Los botones de clasificación y los puntos de la gráfica actualizan los selectores.
   // Observamos sus valores, sin reproducir ni duplicar los cálculos del módulo principal.
   const observer=new MutationObserver(()=>refresh(true));
   observer.observe(byId('agx-query-label'),{childList:true,characterData:true,subtree:true});
   // Observar cambios programáticos a los filtros por municipio/cultivo que se aplican desde el ranking.
   scope.addEventListener('click',ev=>{
     if(ev.target.closest('[data-agx-municipio],[data-agx-cultivo],[data-agx-year],[data-agx-row],[data-agx-action="reset"]'))
       queueMicrotask(()=>refresh(true));
   });
   refresh(true);
 }
 window.addEventListener('growa:data-ready',start);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

