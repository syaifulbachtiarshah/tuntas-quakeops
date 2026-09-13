import { useId, useMemo, useState } from 'react';
import { regionalCountries } from '../data/tsunamiGeography';
import { coastComparison, manilaTrench, rupture2004, tsunamiPlaces, tsunamiReviewed, tsunamiSources, tsunamiTimeline, type CoastId, type TsunamiSourceId, type TsunamiView } from '../data/tsunamiHistory';
import './TsunamiHistory.css';

const project = (point: number[]) => [(point[0] - 88) * 1000 / 37, (25 - point[1]) * 760 / 30];
const pointString = (points: number[][]) => points.map((point) => project(point).join(',')).join(' ');
function polygonPath(rings: number[][][]) {
  return rings.map((ring) => ring.map((point, index) => `${index ? 'L' : 'M'}${project(point).map((n) => n.toFixed(2)).join(' ')}`).join(' ') + ' Z').join(' ');
}
function SourceLink({ id }: { id: TsunamiSourceId }) {
  return <a href={tsunamiSources[id].url} target="_blank" rel="noreferrer">{tsunamiSources[id].label} ↗</a>;
}

export function TsunamiHistory() {
  const [view, setView] = useState<TsunamiView>('compare');
  const [coast, setCoast] = useState<CoastId>('west');
  const [selectedPlace, setSelectedPlace] = useState('penang');
  const [eventId, setEventId] = useState('2004');
  const [showPaths, setShowPaths] = useState(true);
  const [showFaults, setShowFaults] = useState(true);
  const id = useId().replaceAll(':', '');
  const selected = tsunamiPlaces.find((place) => place.id === selectedPlace)!;
  const event = tsunamiTimeline.find((item) => item.id === eventId)!;
  const show2004 = view !== 'manila';
  const showManila = view !== '2004';
  const countries = useMemo(() => regionalCountries.map((country) => ({
    name: country.name,
    path: country.geometry.type === 'Polygon'
      ? polygonPath(country.geometry.coordinates as number[][][])
      : (country.geometry.coordinates as number[][][][]).map(polygonPath).join(' '),
  })), []);

  const chooseCoast = (next: CoastId) => {
    setCoast(next);
    setSelectedPlace(next === 'west' ? 'penang' : 'terengganu');
    setView(next === 'west' ? '2004' : 'manila');
  };

  return <section className="tsunami-workspace" lang="ms" aria-labelledby="tsunami-title">
    <header className="tsunami-heading">
      <div><p className="tsunami-kicker">EARTH Q · ATLAS TSUNAMI MALAYSIA</p><h2 id="tsunami-title">Dua pantai. Sejarah dan sumber berbeza.</h2><p>Bandingkan Terengganu dengan pantai barat Semenanjung melalui rekod 2004 dan kajian Laut China Selatan.</p></div>
      <span className="tsunami-context-tag">SEJARAH & SENARIO KAJIAN</span>
    </header>
    <div className="tsunami-advisory"><strong>Potensi gempa tidak menetapkan tarikh kejadian.</strong><span>Modul rujukan ini tidak memaparkan amaran tsunami semasa. Untuk arahan semasa, rujuk <a href="https://www.met.gov.my/" target="_blank" rel="noreferrer">METMalaysia ↗</a>.</span></div>

    <div className="tsunami-coast-switch" aria-label="Pilih pantai">
      <button type="button" aria-pressed={coast === 'west'} onClick={() => chooseCoast('west')} className={coast === 'west' ? 'selected west' : 'west'}><span>01 · PANTAI BARAT</span><strong>Rekod impak 2004</strong><small>Tumpuan barat laut Semenanjung</small></button>
      <button type="button" aria-pressed={coast === 'east'} onClick={() => chooseCoast('east')} className={coast === 'east' ? 'selected east' : 'east'}><span>02 · TERENGGANU</span><strong>Konteks Laut China Selatan</strong><small>Manila Trench · senario kajian</small></button>
    </div>

    <div className="tsunami-map-layout">
      <section className="tsunami-map-panel" aria-label="Peta interaktif sejarah dan sumber tsunami">
        <div className="tsunami-map-toolbar">
          <div className="tsunami-segments" aria-label="Paparan peta">
            {([{ value: 'compare', label: 'Dua pantai' }, { value: '2004', label: 'Pecahan 2004' }, { value: 'manila', label: 'Manila · senario' }] as const).map((item) => <button type="button" key={item.value} aria-pressed={view === item.value} onClick={() => setView(item.value)}>{item.label}</button>)}
          </div>
          <div className="tsunami-layer-toggles"><label><input type="checkbox" checked={showFaults} onChange={(e) => setShowFaults(e.target.checked)} /> Jejak patahan</label><label><input type="checkbox" checked={showPaths} onChange={(e) => setShowPaths(e.target.checked)} /> Arah gelombang</label></div>
        </div>
        <div className="tsunami-map-frame">
          <svg viewBox={view === '2004' ? '0 200 570 510' : '0 0 1000 760'} className="tsunami-atlas" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
            <title id={`${id}-title`}>{view === '2004' ? 'Konteks pecahan Sumatra–Andaman 2004' : 'Perbandingan Sumatra–Andaman dan Manila Trench'}</title>
            <desc id={`${id}-desc`}>Garis merah menunjukkan anggaran jejak pecahan 2004. Anak panah biru menunjukkan arah perambatan secara skematik. Garis ungu dan anak panah putus-putus menunjukkan konteks senario Manila Trench. Semua garis bersifat ilustrasi, bukan sempadan patahan terukur atau model tsunami. Pilih lokasi menggunakan butang di bawah peta.</desc>
            <defs><marker id={`${id}-blue`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#72ddff" /></marker><marker id={`${id}-violet`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c3a5ff" /></marker></defs>
            <rect x="0" y="0" width="1000" height="760" fill="#071d2b" />
            <g className="tsunami-graticule">{[90, 100, 110, 120].map((lon) => <g key={lon}><line x1={project([lon, 0])[0]} x2={project([lon, 0])[0]} y1="0" y2="760" /><text x={project([lon, 0])[0] + 6} y="744">{lon}°E</text></g>)}{[0, 10, 20].map((lat) => <g key={lat}><line x1="0" x2="1000" y1={project([0, lat])[1]} y2={project([0, lat])[1]} /><text x="8" y={project([0, lat])[1] - 7}>{lat}°N</text></g>)}</g>
            <g>{countries.map((country) => <path key={country.name} d={country.path} className={country.name === 'Malaysia' ? 'tsunami-land malaysia' : 'tsunami-land'} fillRule="evenodd"><title>{country.name}</title></path>)}</g>
            <g className="tsunami-country-labels"><text x="202" y="667" transform="rotate(30 202 667)">SUMATRA</text><text x="338" y="325">THAILAND</text><text x="555" y="663">BORNEO</text><text x="819" y="368">FILIPINA</text><text x="970" y="55" textAnchor="end">TAIWAN</text><text x="356" y="578">MALAYSIA</text></g>
            <g className="tsunami-sea-labels"><text x="54" y="293">Teluk Bengal</text><text x="598" y="399">Laut China Selatan</text><text x="33" y="610">Lautan Hindi</text></g>
            {show2004 && <g>
              {showFaults && <><polyline points={pointString(rupture2004)} className="tsunami-rupture-halo" /><polyline points={pointString(rupture2004)} className="tsunami-rupture" /></>}
              <circle cx={project([96, 3.3])[0]} cy={project([96, 3.3])[1]} r="8" className="tsunami-epicentre" /><text className="tsunami-label" x="110" y="574">M9.1 · 2004</text><text className="tsunami-label sub" x="105" y="596">Permulaan pecahan ≈</text>
              <text className="tsunami-label" x="86" y="374">Andaman</text><text className="tsunami-label" x="238" y="548">Aceh</text>
              {showPaths && <g className="tsunami-wave-paths" markerEnd={`url(#${id}-blue)`}>
                <polyline points={pointString([[94.2, 6.5], [96.8, 7.0], [98.6, 6.9], [99.25, 6.4], [99.55, 5.9], [100.0, 5.35]])} />
                <polyline points={pointString([[93.4, 9.0], [95.5, 8.7], [97.6, 8.0]])} />
                <polyline points={pointString([[93.6, 6.4], [91.1, 6.5], [88.7, 6.7]])} />
              </g>}
              <text className="tsunami-label west" x="265" y="469">Barat laut</text>
            </g>}
            {showManila && <g>
              {showFaults && <polyline points={pointString(manilaTrench)} className="tsunami-manila" />}
              <text className="tsunami-label east" x="685" y="139">Manila Trench ≈</text><text className="tsunami-label sub" x="685" y="163">Sumber senario kajian</text>
              {showPaths && <polyline points={pointString([[119.5, 16], [116, 14], [112, 10.5], [108, 8], [104.0, 5.5]])} className="tsunami-scenario-path" markerEnd={`url(#${id}-violet)`} />}
              <text className="tsunami-label east" x="431" y="523">Terengganu</text>
            </g>}
            {tsunamiPlaces.filter((place) => view === 'compare' || (view === '2004' ? place.coast === 'west' : place.coast === 'east')).map((place) => <g key={place.id}><circle cx={project(place.coordinates)[0]} cy={project(place.coordinates)[1]} r={selectedPlace === place.id ? 10 : 5} fill={place.coast === 'west' ? '#72ddff' : '#c3a5ff'} stroke="#fff" strokeWidth={selectedPlace === place.id ? 2.5 : 1}><title>{`${place.label}: ${place.note}`}</title></circle></g>)}
            <g className="tsunami-north"><text x={view === '2004' ? 538 : 963} y={view === '2004' ? 240 : 40}>N ↑</text></g>
          </svg>
        </div>
        <div className="tsunami-map-legend"><span><i className="red" /> Jejak pecahan 2004 ≈</span><span><i className="blue" /> Arah tsunami 2004 · skematik</span><span><i className="violet" /> Manila · senario sahaja</span></div>
        <p className="tsunami-map-note">≈ Kedudukan anggaran untuk orientasi. Anak panah bukan jejak gelombang terukur atau output model. Peta ini tidak menunjukkan zon limpahan, masa sampai atau sempadan pemindahan.</p>
        <div className="tsunami-place-buttons" aria-label="Lokasi rujukan">{tsunamiPlaces.map((place) => <button type="button" key={place.id} aria-pressed={selectedPlace === place.id} onClick={() => { setSelectedPlace(place.id); setCoast(place.coast); if (view !== 'compare') setView(place.coast === 'west' ? '2004' : 'manila'); }}>{place.label}</button>)}</div>
        <p className="tsunami-place-detail" aria-live="polite"><strong>{selected.label}</strong> {selected.note}</p>
        <p className="tsunami-map-credit">Peta asas: Natural Earth · unjuran equirectangular · garis konteks ditafsir daripada <SourceLink id="usgs2004" /> dan <SourceLink id="eastStudy" />.</p>
      </section>

      <aside className={`tsunami-coast-detail ${coast}`} aria-live="polite">
        <p className="tsunami-kicker">{coast === 'west' ? 'REKOD KEJADIAN · MALAYSIA' : 'TERENGGANU · KONTEKS KAJIAN'}</p>
        <h3>{coast === 'west' ? '2004 meninggalkan bukti nyata.' : 'Sejarah terhad tidak bermaksud risiko sifar.'}</h3>
        {coast === 'west' ? <>
          <div className="tsunami-number"><strong>68</strong><span>kematian di Malaysia<br />26 Disember 2004 · laporan JPS</span></div>
          <dl className="tsunami-casualties"><div><dt>Pulau Pinang</dt><dd>54</dd></div><div><dt>Kedah</dt><dd>11</dd></div><div><dt>Perak</dt><dd>2</dd></div><div><dt>Selangor</dt><dd>1</dd></div></dl>
          <p>Impak tertumpu di barat laut Semenanjung. Kuala Muda, pesisir Pulau Pinang dan Langkawi antara lokasi yang dibincangkan dalam laporan.</p>
          <SourceLink id="jps" />
          <div className="tsunami-insight"><b>Epicentre bukan seluruh kawasan gempa.</b><p>Pecahan 2004 memanjang kira-kira 1,200 km menuju Andaman. Tsunami dijana sepanjang dasar laut yang berubah kedudukan.</p><SourceLink id="usgs2004" /></div>
        </> : <>
          <p>Terengganu tidak disenaraikan sebagai kawasan impak tsunami dalam laporan JPS 2004 yang dirujuk. Ketiadaan rekod itu tidak menetapkan tahap risiko bagi kejadian masa depan.</p><SourceLink id="jps" />
          <div className="tsunami-insight"><b>Sumber lain: Manila Trench.</b><p>Kajian 2023 menilai kemungkinan tsunami menyeberangi Laut China Selatan ke pantai timur Semenanjung.</p><SourceLink id="eastStudy" /></div>
          <div className="tsunami-scenario-card"><span>SENARIO MODEL TUNA · Mw 9.0</span><h4>Contoh hasil kajian Kuala Terengganu</h4><p>Aziz et al. (2023) melaporkan maksimum kedalaman limpahan <b>6 m</b> dan jarak limpahan daratan sehingga <b>6 km</b> bagi senario yang diuji.</p><p><b>Ini hasil bersyarat model.</b> Bukan ketinggian ombak seragam, ramalan kejadian atau sempadan zon bahaya untuk semua kawasan Terengganu.</p><SourceLink id="eastStudy" /></div>
        </>}
      </aside>
    </div>

    <section className="tsunami-history-section" aria-labelledby="history-title"><div className="tsunami-section-heading"><div><p className="tsunami-kicker">GARIS MASA BERSUMBER</p><h3 id="history-title">Apa yang berlaku, apa yang dikaji</h3></div><span>Contoh terpilih · bukan katalog lengkap</span></div>
      <div className="tsunami-timeline-buttons" aria-label="Pilih rekod sejarah">{tsunamiTimeline.map((item) => <button type="button" key={item.id} aria-pressed={eventId === item.id} onClick={() => { setEventId(item.id); setView(item.view); setCoast(item.view === 'manila' ? 'east' : 'west'); setSelectedPlace(item.view === 'manila' ? 'terengganu' : 'penang'); }}><strong>{item.id}</strong><span>{item.type}</span></button>)}</div>
      <article className="tsunami-history-card" aria-live="polite"><div><span className={event.type === 'Kajian' ? 'tsunami-event-type study' : 'tsunami-event-type'}>{event.type}</span><p>{event.date}</p></div><div><h4>{event.title}</h4><p>{event.text}</p><p className="tsunami-relevance">{event.relevance}</p><div className="tsunami-inline-sources">{event.sources.map((source) => <SourceLink key={source} id={source} />)}</div></div></article>
    </section>

    <section className="tsunami-comparison-section" aria-labelledby="comparison-title"><p className="tsunami-kicker">PERBANDINGAN BAHAYA TSUNAMI</p><h3 id="comparison-title">Terengganu berbanding pantai barat</h3><p>Perbandingan kualitatif ini tidak memberi skor risiko bagi alamat tertentu. Risiko gegaran bangunan memerlukan penilaian berasingan.</p><div className="tsunami-table-scroll"><table><thead><tr><th scope="col">Dimensi</th><th scope="col">Pantai barat Semenanjung</th><th scope="col">Terengganu / pantai timur</th></tr></thead><tbody>{coastComparison.map((row) => <tr key={row.topic}><th scope="row">{row.topic}<small><SourceLink id={row.source} /></small></th><td>{row.west}</td><td>{row.east}</td></tr>)}</tbody></table></div></section>

    <section className="tsunami-preparedness"><div><p className="tsunami-kicker">JIKA BERADA DI PANTAI</p><h3>Kenali tanda. Bergerak segera.</h3></div><p>Jika terasa gegaran kuat atau lama, atau air laut berubah mendadak, bergerak ke tempat tinggi atau jauh ke pedalaman selepas gegaran berhenti. Jangan menunggu untuk melihat ombak. Ikut arahan pihak berkuasa dan kekal di kawasan selamat sehingga dibenarkan pulang.</p><div><SourceLink id="noaa" /><SourceLink id="met" /></div></section>

    <details className="tsunami-sources"><summary>Sumber, kaedah dan batas peta</summary><p>Disemak: {tsunamiReviewed}. Geografi menggunakan Natural Earth 1:110 juta. Garis pecahan, trench dan anak panah dilukis secara skematik daripada konteks sumber; ia bukan dataset finite-fault, model propagasi, atau peta pemindahan rasmi. Angka M9.1 bagi 2004 mengikuti USGS. Potensi M9.2 yang dibincangkan dalam penilaian bahaya tidak menetapkan tarikh kejadian.</p><p>Rekod kejadian dan hasil kajian disimpan berasingan. Modul tidak mengira peluang gempa seterusnya atau mengeluarkan amaran. Angka korban mengikut laporan JPS yang dipautkan; perbezaan angka antara laporan perlu dinilai berdasarkan sumber masing-masing.</p><ul>{Object.entries(tsunamiSources).map(([key, source]) => <li key={key}><SourceLink id={key as TsunamiSourceId} /><span>{source.kind}</span></li>)}</ul></details>
    <footer className="tsunami-footer">Earth Q · Semakan sumber {tsunamiReviewed} · <a href="#overview">Kembali ke Command Overview</a></footer>
  </section>;
}
