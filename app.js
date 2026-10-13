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

function bind(){document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.tab)));document.querySelectorAll('[data-export]').forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.export;if(mode==='state')downloadCSV('sinaloa_estado_2003_2025.csv',D.state);if(mode==='municipality')downloadCSV(`sinaloa_${slug(state.municipio)}_2003_2025.csv`,D.byMuni.get(state.municipio).annual);if(mode==='crop')downloadCSV(`sinaloa_cultivo_${slug(state.cultivo)}.csv`,cropInfo(state.cultivo).aggregated)}));$('state-municipios').addEventListener('click',e=>{const btn=e.target.closest('[data-open-muni]');if(!btn)return;state.municipio=btn.dataset.openMuni;renderMunicipio();navigate('municipios')});$('municipio').addEventListener('change',e=>{state.municipio=e.target.value;state.search='';$('municipio-search').value='';renderMunicipio()});$('cultivo').addEventListener('change',e=>{state.cultivo=e.target.value;renderCultivo()});document.querySelectorAll('[data-metric]').forEach(btn=>btn.addEventListener('click',()=>{state.municipioMetric=btn.dataset.metric;renderMunicipio()}));$('municipio-search').addEventListener('input',e=>{state.search=e.target.value;renderMuniCropList()});$('municipio-order').addEventListener('change',e=>{state.order=e.target.value;renderMuniCropList()});$('municipio-crop-list').addEventListener('click',e=>{const btn=e.target.closest('[data-muni-crop]');if(!btn)return;state.activeMunicipioCrop=btn.dataset.muniCrop;renderMuniCropList()});window.addEventListener('hashchange',()=>{const tab=location.hash.slice(1);if(['panorama','explorar-estados','explorar-cultivos','laboratorio','municipios','cultivos','mexico','metodologia'].includes(tab))navigate(tab)})}
async function init(){try{await load();window.GrowaSinaloaData={D,R};window.dispatchEvent(new Event('growa:data-ready'));for(const m of D.muniNames){const o=document.createElement('option');o.value=m;o.textContent=m;$('municipio').append(o)}for(const c of D.cropNames){const o=document.createElement('option');o.value=c;o.textContent=c;$('cultivo').append(o)}bind();installResearchTools();renderPanorama();renderMunicipio();renderCultivo();renderMetodologia();navigate(['panorama','explorar-estados','explorar-cultivos','laboratorio','municipios','cultivos','mexico','metodologia'].includes(location.hash.slice(1))?location.hash.slice(1):'panorama');$('status').textContent='Datos cargados · DGSIAP';}catch(err){console.error(err);$('status').textContent='No se pudo cargar la serie';$('alert').hidden=false;$('alert').textContent='No se pudieron inicializar los datos del observatorio: '+err.message}}

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
window.addEventListener('hashchange',()=>{const tab=location.hash.slice(1);if(['panorama','explorar-estados','explorar-cultivos','laboratorio','metodologia'].includes(tab)&&state.tab!==tab)navigate(tab)});
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
