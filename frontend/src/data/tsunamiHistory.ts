export type CoastId = 'west' | 'east';
export type TsunamiView = 'compare' | '2004' | 'manila';
export const tsunamiReviewed = '13 September 2026';

export const tsunamiSources = {
  usgs2004: { label: 'USGS · gempa dan tsunami 2004/2005', url: 'https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake', kind: 'Agensi saintifik' },
  jps: { label: 'JPS · Malaysia’s Response to the December 2004 Tsunami', url: 'https://www.water.gov.my/jps/resources/auto%20download%20images/5844e2fa0dd1f.pdf', kind: 'Laporan pascabencana' },
  met: { label: 'METMalaysia · fakta dan keselamatan tsunami', url: 'https://www.met.gov.my/pendidikan/tsunami/', kind: 'Panduan rasmi' },
  eastStudy: { label: 'Aziz et al. (2023) · kajian pantai timur, TUNA', url: 'https://doi.org/10.1007/s13201-022-01860-8', kind: 'Kajian pemodelan' },
  scs: { label: 'Xu et al. (2021) · sejarah dan pemantauan Laut China Selatan', url: 'https://www.met.gov.my/data/research/researchpapers/2021/RP05_2021.pdf', kind: 'Kajian saintifik' },
  mindoro: { label: 'PHIVOLCS · gempa Mindoro, 15 November 1994', url: 'https://www.phivolcs.dost.gov.ph/1994-november-15-ms7-1-mindoro-earthquake/', kind: 'Agensi saintifik' },
  usgs2012: { label: 'USGS · pemerhatian tsunami Sumatra 2012', url: 'https://www.usgs.gov/publications/real-time-forecasting-april-11-2012-sumatra-tsunami', kind: 'Kajian pemerhatian' },
  usgsStrike: { label: 'USGS · mekanisme gempa 2012', url: 'https://www.usgs.gov/publications/11-april-2012-east-indian-ocean-earthquake-triggered-large-aftershocks-worldwide', kind: 'Kajian saintifik' },
  bmkg: { label: 'BMKG · potensi gempa bukan ramalan', url: 'https://www.bmkg.go.id/berita/utama/tentang-gempa-di-selat-sunda-dan-mentawai-siberut-yang-tinggal-menunggu-waktu', kind: 'Penjelasan rasmi' },
  noaa: { label: 'NOAA/NWS · tindakan ketika tsunami', url: 'https://www.weather.gov/safety/tsunami-during', kind: 'Panduan keselamatan' },
  geography: { label: 'Natural Earth · peta asas 1:110 juta', url: 'https://www.naturalearthdata.com/about/terms-of-use/', kind: 'Data geografi · public domain' },
} as const;
export type TsunamiSourceId = keyof typeof tsunamiSources;

export const coastComparison: { topic: string; west: string; east: string; source: TsunamiSourceId }[] = [
  { topic: 'Sumber yang perlu diperhatikan', west: 'Zon Sumatra–Andaman dan Lautan Hindi. Pendedahan berbeza mengikut bahagian pantai.', east: 'Manila Trench di Laut China Selatan ialah satu sumber yang dikaji untuk Terengganu.', source: 'eastStudy' },
  { topic: 'Rekod 26 Disember 2004', west: 'Impak tertumpu di barat laut: Perlis, Kedah, Pulau Pinang dan Perak; gangguan paras air hingga utara Selangor.', east: 'Terengganu tidak disenaraikan sebagai kawasan impak dalam laporan JPS 2004 yang dirujuk.', source: 'jps' },
  { topic: 'Sejarah berbanding senario', west: 'Tsunami pemusnah 2004 ialah rekod kejadian sebenar di Malaysia.', east: 'Kajian 2023 menyatakan pantai timur belum mengalami tsunami dalam rekod yang dibincangkannya. Ini bukan bukti risiko sifar.', source: 'eastStudy' },
  { topic: 'Peranan geografi', west: 'Pulau, teluk dan bentuk dasar laut mengubah laluan serta kekuatan gelombang. Sumatra tidak menjamin semua pantai terlindung.', east: 'Pendedahan kepada Laut China Selatan memerlukan penilaian sumber dan laluan gelombang tersendiri.', source: 'met' },
  { topic: 'Masa sampai & tinggi air', west: 'Tidak boleh ditentukan daripada magnitud atau epicentre sahaja.', east: 'Angka sesuatu kajian bergantung pada senario dan data model; bukan masa pemindahan yang dijamin.', source: 'met' },
];

export const tsunamiTimeline: { id: string; date: string; title: string; type: 'Rekod kejadian' | 'Kajian'; text: string; relevance: string; sources: TsunamiSourceId[]; view: TsunamiView }[] = [
  { id: '1994', date: '15 Nov 1994', title: 'Mindoro, Filipina', type: 'Rekod kejadian', text: 'Gempa M7.1 menghasilkan tsunami tempatan di kawasan Mindoro. Ia bukan rekod tsunami di Terengganu.', relevance: 'Konteks serantau: sumber tsunami di sekitar Filipina perlu dibezakan mengikut mekanisme dan lokasinya.', sources: ['mindoro'], view: 'manila' },
  { id: '2004', date: '26 Dis 2004', title: 'Sumatra–Andaman', type: 'Rekod kejadian', text: 'USGS menggunakan M9.1. Pecahan memanjang kira-kira 1,200 km ke Andaman; pengangkatan dan penurunan dasar laut menjana tsunami.', relevance: 'JPS merekodkan 68 kematian Malaysia: Pulau Pinang 54, Kedah 11, Perak 2 dan Selangor 1.', sources: ['usgs2004', 'jps'], view: '2004' },
  { id: '2005', date: '28 Mac 2005', title: 'Nias–Simeulue / utara Sumatra', type: 'Rekod kejadian', text: 'Gempa M8.6 menghasilkan tsunami lebih kecil berbanding 2004, seperti dihuraikan oleh USGS.', relevance: 'Magnitud besar sahaja tidak menentukan saiz tsunami; kedudukan pergerakan dasar laut juga penting.', sources: ['usgs2004'], view: '2004' },
  { id: '2012', date: '11 Apr 2012', title: 'Lautan Hindi, barat Sumatra', type: 'Rekod kejadian', text: 'Gempa M8.6 didominasi pergerakan mendatar (strike-slip). Tsunaminya tetap direkodkan oleh stesen paras laut dan sensor dasar laut.', relevance: '“Strike-slip” tidak bermaksud mustahil berlaku tsunami. Penilaian memerlukan pemerhatian sebenar.', sources: ['usgsStrike', 'usgs2012'], view: '2004' },
  { id: '2021', date: '2021', title: 'Pemantauan Laut China Selatan', type: 'Kajian', text: 'Kajian sejarah gempa, tsunami dan pemantauan masa nyata diterbitkan bersama penyelidik meteorologi serantau.', relevance: 'Menjelaskan keperluan pemantauan di lembangan Laut China Selatan; bukan pengumuman kejadian baharu.', sources: ['scs'], view: 'manila' },
  { id: '2023', date: '7 Jan 2023', title: 'Senario pantai timur Malaysia', type: 'Kajian', text: 'Aziz et al. menguji sumber Manila Trench pada Mw 7.0, 8.0 dan 9.0 menggunakan model TUNA.', relevance: 'Hasil simulasi memberi konteks perancangan untuk Terengganu. Tarikh kajian bukan tarikh gempa.', sources: ['eastStudy'], view: 'manila' },
];

// These are deliberately coarse schematic traces, NOT surveyed fault geometries,
// finite-fault products, modelled wave tracks, inundation polygons or evacuation boundaries.
// Coordinates use [longitude, latitude]. Interpretations are grounded in the linked sources.
export const rupture2004 = [[96, 3.3], [94.9, 4.6], [93.7, 6.2], [92.8, 8.1], [92.3, 10], [92.5, 12], [93, 14]];
export const manilaTrench = [[119.7, 13], [119.5, 15], [119.6, 17], [120, 19], [120.5, 21]];
export const tsunamiPlaces: { id: string; label: string; coordinates: number[]; coast: CoastId; note: string }[] = [
  { id: 'langkawi', label: 'Langkawi', coordinates: [99.72, 6.35], coast: 'west', note: 'Kawasan impak 2004 di Kedah; pantai dan marina terjejas dalam laporan JPS.' },
  { id: 'penang', label: 'Pulau Pinang', coordinates: [100.24, 5.39], coast: 'west', note: 'JPS merekodkan 54 kematian di negeri Pulau Pinang pada 2004.' },
  { id: 'kualamuda', label: 'Kuala Muda', coordinates: [100.37, 5.58], coast: 'west', note: 'Komuniti pesisir dan muara sungai mengalami kerosakan tsunami 2004.' },
  { id: 'terengganu', label: 'Kuala Terengganu', coordinates: [103.14, 5.33], coast: 'east', note: 'Lokasi kajian senario Manila Trench; bukan penanda kejadian tsunami sebenar atau kawasan pemindahan.' },
  { id: 'dungun', label: 'Dungun', coordinates: [103.42, 4.76], coast: 'east', note: 'Penanda orientasi di pantai Terengganu. Modul ini tidak menentukan risiko untuk sesuatu alamat.' },
];
