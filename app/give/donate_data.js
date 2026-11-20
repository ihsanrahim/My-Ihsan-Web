/* 0.5.14 Derma (Donate) directory, bundled copy. The app also reads an updated list from DONATE_URL (GitHub Pages) when online.
   ok:true  = contact details checked against the organisation's own pages or official material (src, chk = date checked).
   ok:false = listed so people can find it, but phone / email not yet checked: the app shows Search and Map instead of contacts.
   Never add a phone, email or bank account that has not been checked. Listing is free for legitimate organisations. */
window.DONATE_DATA = {v:1, updated:"2026-11-09",
cats:[["relief","🌍","Kemanusiaan","Humanitarian"],["zakat","💰","Zakat","Zakat"],["wakaf","🕌","Wakaf","Waqf"],["masjid","🕌","Masjid","Masjid"],["orphan","🧒","Anak yatim","Orphans"],
  ["elderly","👵","Warga emas","Elderly"],["health","🏥","Kesihatan","Health"],["food","🍚","Makanan","Food aid"],["mualaf","🤝","Dakwah & mualaf","Dakwah & converts"],["edu","📚","Pendidikan & tahfiz","Education & tahfiz"]],
orgs:[
 {id:"mycare", n:"Humanitarian Care Malaysia (MyCARE)", cat:"relief", area:"Seri Kembangan, Selangor", d:["Bantuan kemanusiaan dalam dan luar negara, bencana, Palestin.","Humanitarian aid in Malaysia and abroad, disasters, Palestine."],
  web:"https://www.mycare.org.my", donate:"https://www.mycare.org.my/donate", tel:"03-8941 2341", email:"admin@mycare.org.my", reg:"SSM 729288-P", ok:true, src:"mycare.org.my", chk:"2026-11-09"},
 {id:"hidayah", n:"Hidayah Centre Foundation", cat:"mualaf", area:"Kuala Lumpur", d:["Bimbingan saudara baharu (mualaf) dan dakwah.","Guidance for new Muslims (mualaf) and dakwah."], web:"https://www.hidayahcentre.org.my", ok:false},
 {id:"irm", n:"Islamic Relief Malaysia", cat:"relief", area:"Bandar Baru Bangi, Selangor", d:["Kemanusiaan, korban, anak yatim dan bencana.","Humanitarian relief, qurban, orphans and disasters."],
  web:"https://www.islamic-relief.org.my", tel:"03-8926 3434", email:"info@islamic-relief.org.my", ok:true, src:"islamic-relief.org (partner offices)", chk:"2026-11-09"},
 {id:"mercy", n:"MERCY Malaysia", cat:"health", area:"Jalan Syed Putra, Kuala Lumpur", d:["Bantuan perubatan dan kecemasan bencana.","Medical relief and disaster response."],
  web:"https://www.mercy.org.my", tel:"03-2276 2116", email:"info@mercy.org.my", ok:true, src:"mercy.org.my", chk:"2026-11-09"},
 {id:"ppz", n:"Pusat Pungutan Zakat MAIWP (PPZ-MAIWP)", cat:"zakat", area:"Wilayah Persekutuan", d:["Bayar zakat fitrah, pendapatan, harta dan perniagaan di Wilayah Persekutuan.","Pay zakat fitrah, income, wealth and business zakat in the Federal Territories."],
  web:"https://www.zakat.com.my", donate:"https://www.zakat.com.my", tel:"1300-88-5757", ok:true, src:"zakat.com.my (via Kosmo, Sinar Harian)", chk:"2026-11-09"},
 {id:"lzs", n:"Lembaga Zakat Selangor", cat:"zakat", area:"Selangor", d:["Bayaran dan agihan zakat negeri Selangor.","Zakat payment and distribution for Selangor."], web:"https://www.zakatselangor.com.my", ok:false},
 {id:"gpm", n:"Global Peace Mission (GPM) Malaysia", cat:"relief", area:"Wangsa Maju, Kuala Lumpur", d:["Bantuan kemanusiaan, infak bulanan untuk asnaf.","Humanitarian aid and monthly giving for the needy."], web:"https://gpm.com.my", ok:false},
 {id:"perkim", n:"PERKIM (Pertubuhan Kebajikan Islam Malaysia)", cat:"mualaf", area:"Jalan Sultan Azlan Shah, Kuala Lumpur", d:["Kebajikan dan bimbingan saudara baharu sejak 1960.","Welfare and guidance for new Muslims since 1960."], web:"https://www.perkim.net.my", ok:false},
 {id:"macma", n:"MACMA (Persatuan Cina Muslim Malaysia)", cat:"mualaf", area:"Kuala Lumpur", d:["Dakwah dan bimbingan mualaf Cina.","Dakwah and support for Chinese new Muslims."], ok:false, q:"MACMA Malaysian Chinese Muslim Association"},
 {id:"masjidnegara", n:"Masjid Negara", cat:"masjid", area:"Kuala Lumpur", d:["Masjid Negara Malaysia.","The National Mosque of Malaysia."], ok:false, q:"Masjid Negara Kuala Lumpur"},
 {id:"mwp", n:"Masjid Wilayah Persekutuan", cat:"masjid", area:"Jalan Duta, Kuala Lumpur", d:["Masjid utama Wilayah Persekutuan.","The main masjid of the Federal Territory."], ok:false, q:"Masjid Wilayah Persekutuan Kuala Lumpur"},
 {id:"assyakirin", n:"Masjid As-Syakirin KLCC", cat:"masjid", area:"KLCC, Kuala Lumpur", d:["Masjid di Taman KLCC.","The masjid in KLCC Park."], ok:false, q:"Masjid As-Syakirin KLCC"},
 {id:"maiwp", n:"Majlis Agama Islam Wilayah Persekutuan (MAIWP)", cat:"wakaf", area:"Kuala Lumpur", d:["Wakaf, baitulmal dan pengurusan masjid Wilayah Persekutuan.","Waqf, baitulmal and masjid management for the Federal Territories."], ok:false, q:"MAIWP wakaf"},
 {id:"pws", n:"Perbadanan Wakaf Selangor", cat:"wakaf", area:"Shah Alam, Selangor", d:["Wakaf tunai dan projek wakaf Selangor.","Cash waqf and waqf projects in Selangor."], ok:false, q:"Perbadanan Wakaf Selangor"},
 {id:"ywm", n:"Yayasan Waqaf Malaysia", cat:"wakaf", area:"Putrajaya", d:["Yayasan wakaf peringkat persekutuan.","The federal waqf foundation."], ok:false, q:"Yayasan Waqaf Malaysia"},
 {id:"foodaid", n:"Food Aid Foundation", cat:"food", area:"Kuala Lumpur", d:["Bank makanan untuk rumah kebajikan dan keluarga susah.","Food bank for welfare homes and families in need."], ok:false, q:"Food Aid Foundation Malaysia"},
 {id:"foodbank", n:"Yayasan Food Bank Malaysia", cat:"food", area:"Malaysia", d:["Agihan makanan kepada golongan memerlukan.","Food distribution for people in need."], ok:false, q:"Yayasan Food Bank Malaysia"},
 {id:"muslimaid", n:"Muslim Aid Malaysia", cat:"relief", area:"Selangor", d:["Yayasan kemanusiaan (sejak 2008).","Humanitarian foundation (since 2008)."], ok:false, q:"Muslim Aid Malaysia Humanitarian Foundation"},
 {id:"amal", n:"Yayasan Amal Malaysia", cat:"relief", area:"Kuala Lumpur", d:["Bantuan kemanusiaan dan bencana.","Humanitarian and disaster aid."], ok:false, q:"Yayasan Amal Malaysia"},
 {id:"titiankaseh", n:"Rumah Titian Kaseh", cat:"orphan", area:"Kuala Lumpur", d:["Rumah anak yatim dan kanak-kanak memerlukan.","Home for orphans and children in need."], ok:false, q:"Rumah Titian Kaseh"},
 {id:"darulkifayah", n:"Pertubuhan Kebajikan Darul Kifayah", cat:"orphan", area:"Kuala Lumpur", d:["Rumah anak yatim.","Orphanage."], ok:false, q:"Darul Kifayah Kuala Lumpur"},
 {id:"rsk", n:"Rumah Seri Kenangan Cheras (JKM)", cat:"elderly", area:"Cheras, Kuala Lumpur", d:["Rumah warga emas kendalian Jabatan Kebajikan Masyarakat.","Elderly home run by the Social Welfare Department."], ok:false, q:"Rumah Seri Kenangan Cheras"},
 {id:"imaret", n:"IMARET (Islamic Medical Association Response & Relief Team)", cat:"health", area:"Kuala Lumpur", d:["Pasukan perubatan sukarela untuk bencana.","Volunteer medical relief team."], ok:false, q:"IMARET Islamic Medical Association Malaysia"},
 {id:"nkf", n:"National Kidney Foundation Malaysia", cat:"health", area:"Petaling Jaya", d:["Rawatan dialisis bersubsidi.","Subsidised dialysis treatment."], ok:false, q:"National Kidney Foundation Malaysia"},
 {id:"darulquran", n:"Maahad tahfiz berdaftar berdekatan", cat:"edu", area:"Berdekatan anda", d:["Cari maahad tahfiz yang berdaftar dengan jabatan agama negeri.","Find tahfiz schools registered with the state religious department."], ok:false, q:"maahad tahfiz berdaftar"}
]};
