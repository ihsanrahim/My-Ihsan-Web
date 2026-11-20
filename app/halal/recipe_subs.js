/* Recipe builder: halal swap table (bundled, works offline). 0.2.9.
   Each entry: rx = matches the ingredient name (lower case), not = skip when this also matches,
   st = X haram / S syubhah / T tip only (halal, but buy a halal-certified one),
   sw = swaps [{when (optional regex on the name), ms, en, s:[short ms, short en], k (qty factor), add:[ms,en]}],
   why = [ms, en]. The first matching entry wins, so the order matters.
   Follows Malaysian practice (JAKIM, Muzakarah Fatwa Kebangsaan) and the Shafi'i school.
   A guide only, not a fatwa. Needs ustaz review before release, like the other religious text in the app. */
(function(){
"use strict";
var ALC = ["Arak (khamr) haram walaupun sedikit, dan alkohol tidak hilang sepenuhnya semasa dimasak.","Alcoholic drinks (khamr) are haram even in small amounts, and alcohol does not fully cook off."];
var PORK = ["Babi dan semua hasilnya haram.","Pork and everything made from it is haram."];
var MEATT = ["Gunakan daging atau ayam yang disembelih secara halal (logo halal JAKIM).","Use halal-slaughtered meat or poultry (JAKIM halal logo)."];
var SUBS = [
  // ---- vinegars first, so "red wine vinegar" is not read as wine ----
  {k:"balsamic", rx:/\bbalsamic\b|cuka balsamik/, st:"S",
    sw:[{ms:"cuka balsamik berlogo halal, atau cuka epal + ½ sudu kecil madu bagi setiap sudu besar", en:"halal-certified balsamic, or apple cider vinegar + ½ tsp honey per tbsp", s:["cuka epal dan madu","apple cider vinegar and honey"]}],
    why:["Balsamik dibuat daripada jus anggur yang ditapai; sesetengah jenama ditambah cuka wain. Pilih yang berlogo halal.","Balsamic is made from fermented grape must, and some brands add wine vinegar. Choose a halal-certified one."]},
  {k:"winevin", rx:/\b(wine|sherry|champagne|rice wine)\s+vinegar\b|cuka wain|cuka arak/, st:"S",
    sw:[{ms:"cuka epal atau cuka beras", en:"apple cider vinegar or rice vinegar", s:["cuka epal","apple cider vinegar"]}],
    why:["Cuka wain dibuat dengan sengaja daripada arak; dalam mazhab Syafi'i ia tidak suci. Cuka epal atau beras rasanya hampir sama.","Wine vinegar is deliberately made from wine; in the Shafi'i school it is not pure. Apple cider or rice vinegar tastes close."]},
  // ---- alcohol ----
  {k:"mirin", rx:/\b(aji[- ]?)?mirin\b/, not:/halal|tanpa alkohol|alcohol[- ]free/, st:"X",
    sw:[{ms:"cuka beras + ½ sudu kecil gula bagi setiap sudu besar (atau mirin berlogo halal)", en:"rice vinegar + ½ tsp sugar per tbsp (or halal-certified mirin-style seasoning)", s:["cuka beras dan gula","rice vinegar and sugar"]}], why:ALC},
  {k:"ricewine", rx:/\b(shao ?xing|shao ?hsing|hua ?tiao|rice wine|cooking sake|sake|soju|makgeolli|mijiu)\b|arak (masak|beras|cina)|wain beras/, not:/vinegar|cuka/, st:"X",
    sw:[{ms:"stok ayam + 1 sudu kecil cuka beras bagi setiap ¼ cawan", en:"chicken stock + 1 tsp rice vinegar per ¼ cup", s:["stok ayam","chicken stock"]}], why:ALC},
  {k:"bubbly", rx:/\b(champagne|prosecco|cava|sparkling wine)\b/, not:/vinegar|cuka/, st:"X",
    sw:[{ms:"jus anggur putih berkarbonat", en:"sparkling white grape juice", s:["jus anggur berkarbonat","sparkling grape juice"]}], why:ALC},
  {k:"whitewine", rx:/\b(white|dry white|sauvignon|chardonnay|pinot grigio|riesling)\b[\w ]*\bwines?\b|\bvermouth\b|wain putih/, not:/vinegar|cuka/, st:"X",
    sw:[{ms:"jus anggur putih + stok ayam atau sayur (1:1) + 1 sudu kecil jus lemon bagi setiap cawan", en:"white grape juice + chicken or vegetable stock (1:1) + 1 tsp lemon juice per cup", s:["jus anggur putih dan stok","white grape juice and stock"]}], why:ALC},
  {k:"wine", rx:/\bwines?\b|\bwain\b|\bsherry\b|\bmarsala\b|\bmadeira\b|\bport\b(?= wine)|\bsangria\b/, not:/vinegar|cuka|grape juice|jus anggur|alcohol[- ]free|tanpa alkohol/, st:"X",
    sw:[{ms:"jus anggur merah + stok daging (3:1) + 1 sudu kecil jus lemon bagi setiap cawan", en:"red grape juice + beef stock (3:1) + 1 tsp lemon juice per cup", s:["jus anggur merah dan stok","red grape juice and stock"]}], why:ALC},
  {k:"cider", rx:/\bhard cider\b|^cider$|\b(dry|alcoholic) cider\b/, st:"X",
    sw:[{ms:"jus epal", en:"apple juice", s:["jus epal","apple juice"]}], why:ALC},
  {k:"beer", rx:/\b(beer|ale|lager|stout|guinness|pilsner|porter)\b|\bbir\b/, not:/ginger ale|root beer|halia/, st:"X",
    sw:[{when:/batter|adunan|tempura|fish/, ms:"air soda sejuk (berkarbonat)", en:"ice-cold sparkling water", s:["air soda","sparkling water"]},
        {ms:"stok daging + 1 sudu kecil kicap atau molases bagi setiap cawan (untuk adunan goreng: air soda sejuk)", en:"beef stock + 1 tsp soy sauce or molasses per cup (for batter: ice-cold sparkling water)", s:["stok daging","beef stock"]}],
    why:["Bir ialah arak. Bir \"0.0\" juga dielakkan dalam amalan Malaysia.","Beer is khamr. \"0.0\" beer is also avoided in Malaysian practice."]},
  {k:"coffeeliq", rx:/\b(kahlua|tia maria|coffee liqueur)\b/, st:"X",
    sw:[{ms:"kopi pekat atau espresso + ½ sudu kecil gula", en:"strong coffee or espresso + ½ tsp sugar", s:["kopi pekat","strong coffee"]}], why:ALC},
  {k:"orangeliq", rx:/\b(grand marnier|cointreau|triple sec|cura[cç]ao|orange liqueur)\b/, st:"X",
    sw:[{ms:"jus oren + ½ sudu kecil kulit oren parut", en:"orange juice + ½ tsp grated orange zest", s:["jus oren","orange juice"]}], why:ALC},
  {k:"irish", rx:/\b(baileys|irish cream)\b/, st:"X",
    sw:[{ms:"krim + sedikit kopi + esen vanila tanpa alkohol", en:"cream + a little coffee + alcohol-free vanilla", s:["krim kopi","coffee cream"]}], why:ALC},
  {k:"amaretto", rx:/\b(amaretto|frangelico)\b/, st:"X",
    sw:[{ms:"air + ¼ sudu kecil esen badam tanpa alkohol", en:"water + ¼ tsp alcohol-free almond essence", s:["esen badam","almond essence"]}], why:ALC},
  {k:"kirsch", rx:/\b(kirsch|kirschwasser|cherry brandy|cherry liqueur|maraschino liqueur)\b/, st:"X",
    sw:[{ms:"jus ceri", en:"cherry juice", s:["jus ceri","cherry juice"]}], why:ALC},
  {k:"vodka", rx:/\bvodka\b/, st:"X",
    sw:[{ms:"air + sedikit perahan lemon (vodka hanya mencairkan sos)", en:"water + a squeeze of lemon (vodka only thins the sauce)", s:["air dan lemon","water and lemon"]}], why:ALC},
  {k:"rum", rx:/\b(dark |white |spiced )?rum\b/, st:"X",
    sw:[{ms:"jus epal atau nanas + beberapa titis esen vanila tanpa alkohol", en:"apple or pineapple juice + a few drops of alcohol-free vanilla", s:["jus epal","apple juice"]}],
    why:["Rum ialah arak. Elakkan juga \"perisa rum\": JAKIM tidak membenarkan nama arak pada makanan halal.","Rum is khamr. Also avoid \"rum flavouring\": JAKIM does not allow the names of alcoholic drinks on halal food."]},
  {k:"brandy", rx:/\b(brandy|cognac|armagnac|calvados|whisk(e)?y|bourbon|scotch)\b/, st:"X",
    sw:[{ms:"jus epal atau jus anggur putih (+ ½ sudu kecil esen vanila tanpa alkohol untuk bourbon/wiski)", en:"apple or white grape juice (+ ½ tsp alcohol-free vanilla for bourbon/whisky)", s:["jus epal","apple juice"]}], why:ALC},
  {k:"spirit", rx:/\b(gin|tequila|mezcal|grappa|absinthe|ouzo|schnapps|limoncello|liqueur|liquor|spirits?|alcohol|tuak|todi|toddy)\b|\barak\b/, not:/alcohol[- ]free|non[- ]alcoholic|tanpa alkohol|rubbing|cuka/, st:"X",
    sw:[{ms:"jus buah yang sepadan atau air (hanya untuk rasa)", en:"a matching fruit juice or water (it is only there for flavour)", s:["jus buah","fruit juice"]}], why:ALC},
  // ---- pork ----
  {k:"baconfat", rx:/\b(bacon|pork) (fat|grease|drippings?)\b|lemak (babi|bekon)/, st:"X",
    sw:[{ms:"minyak sapi (ghee) atau minyak masak", en:"ghee or cooking oil", s:["minyak sapi","ghee"]}], why:PORK},
  {k:"lard", rx:/\blard\b|\blardo\b|lemak babi|minyak babi|\bpork fat\b/, st:"X",
    sw:[{ms:"minyak sapi, mentega atau lemak sayuran (shortening)", en:"ghee, butter or vegetable shortening", s:["minyak sapi","ghee"]}], why:PORK},
  {k:"bacon", rx:/\b(bacon|lardons?|pancetta|guanciale)\b|\bbekon\b/, not:/(beef|turkey|chicken|halal|lembu|ayam|daging|veggie|vegan)\s*(bacon|bekon)/, st:"X",
    sw:[{ms:"bekon daging lembu atau ayam belanda berlogo halal (tambah 1 sudu besar minyak jika resipi memasak dalam lemak bekon)", en:"halal beef or turkey bacon (add 1 tbsp oil if the recipe cooks in the bacon fat)", s:["bekon lembu halal","halal beef bacon"]}], why:PORK},
  {k:"cured", rx:/\b(prosciutto|parma ham|serrano|jam[oó]n|speck|coppa|capicola|culatello)\b/, st:"X",
    sw:[{ms:"daging lembu salai (bresaola) berlogo halal", en:"halal beef bresaola or smoked beef slices", s:["daging salai halal","halal smoked beef"]}], why:PORK},
  {k:"ham", rx:/\b(ham|gammon|ham hocks?)\b/, not:/(turkey|chicken|ayam|halal|beef|lembu)\s+ham|hamburger|hampers?/, st:"X",
    sw:[{ms:"ham ayam atau ayam belanda salai berlogo halal", en:"halal smoked turkey or chicken ham", s:["ham ayam halal","halal chicken ham"]}], why:PORK},
  {k:"chorizo", rx:/\b(chorizo|salami|mortadella|soppressata|'?nduja|bratwurst|kielbasa|andouille|luncheon meat|spam|frankfurters?|hot ?dogs?|pepperoni|black pudding|blood sausage|morcilla)\b/, not:/(beef|chicken|halal|lembu|ayam|turkey)\s+/, st:"X",
    sw:[{when:/black pudding|blood|morcilla/, ms:"tinggalkan, atau guna sosej daging lembu halal", en:"leave it out, or use halal beef sausage", s:["sosej lembu halal","halal beef sausage"]},
        {ms:"versi daging lembu atau ayam berlogo halal (cth. chorizo lembu halal)", en:"a halal beef or chicken version (e.g. halal beef chorizo)", s:["versi lembu halal","halal beef version"]}],
    why:["Biasanya dibuat daripada babi (atau darah). Versi halal mudah didapati.","Usually made from pork (or blood). Halal versions are easy to find."]},
  {k:"pork", rx:/\b(pork|pig|piglet|swine|boar|char siu|cha siu|siu yuk|carnitas|chicharr[oó]n|pork rinds?|crackling|tonkotsu|spare ?ribs|baby back ribs)\b|\bbabi\b|\bkhinzir\b/, not:/(beef|chicken|lamb|lembu|ayam|kambing|halal)\s+(spare ?ribs|ribs|crackling)/, st:"X",
    sw:[{when:/mince|ground|cincang|kisar/, ms:"daging ayam atau lembu cincang (halal)", en:"minced chicken or beef (halal)", s:["daging cincang halal","halal minced meat"]},
        {when:/belly|perut|siu yuk/, ms:"rusuk pendek lembu atau peha ayam tanpa tulang (dengan kulit)", en:"beef short ribs or boneless chicken thigh (skin on)", s:["peha ayam","chicken thigh"]},
        {when:/chop/, ms:"daging kambing (chop)", en:"lamb chops", s:["chop kambing","lamb chops"]},
        {when:/shoulder|butt|pulled|carnitas|bahu/, ms:"daging lembu (chuck) atau bahu kambing", en:"beef chuck or lamb shoulder", s:["daging lembu","beef chuck"]},
        {when:/rib/, ms:"rusuk pendek lembu", en:"beef short ribs", s:["rusuk lembu","beef short ribs"]},
        {when:/bone|tonkotsu|tulang|stock|broth/, ms:"tulang ayam (sup pekat gaya paitan)", en:"chicken bones (rich paitan-style broth)", s:["tulang ayam","chicken bones"]},
        {when:/rind|crackling|chicharr/, ms:"kulit ayam rangup", en:"crispy chicken skin", s:["kulit ayam","chicken skin"]},
        {when:/char siu|cha siu/, ms:"char siu ayam (peha ayam)", en:"chicken char siu (chicken thigh)", s:["char siu ayam","chicken char siu"]},
        {when:/loin|tenderloin|fillet/, ms:"isi dada ayam atau batang pinang lembu", en:"chicken breast or beef tenderloin", s:["dada ayam","chicken breast"]},
        {ms:"ayam atau daging lembu halal, potongan yang sama", en:"halal chicken or beef, same cut", s:["ayam atau lembu","chicken or beef"]}], why:PORK},
  {k:"gelatin", rx:/\bgelatine?\b|\bgelatin (sheets?|leaves?|powder)\b/, not:/halal|agar|fish gelatin|bovine.*halal/, st:"S",
    sw:[{ms:"gelatin berlogo halal (lembu atau ikan), jumlah sama; atau serbuk agar-agar kira-kira ⅓ jumlah, didihkan 1–2 minit", en:"halal-certified gelatine (beef or fish), same amount; or agar-agar powder at about ⅓ the amount, boiled for 1–2 minutes", s:["gelatin halal","halal gelatine"]}],
    why:["Gelatin selalunya daripada babi atau lembu yang tidak disembelih. Agar-agar lebih keras; didihkan supaya ia set.","Gelatine is often from pork or unslaughtered cattle. Agar sets firmer and must be boiled to set."]},
  {k:"sweets", rx:/\b(marshmallows?|gummy|gummies|jelly (beans|babies|sweets)|jell-?o|jelly crystals)\b/, not:/halal/, st:"S",
    sw:[{ms:"versi berlogo halal", en:"a halal-certified version", s:["versi halal","halal version"]}],
    why:["Selalunya mengandungi gelatin yang tidak diketahui sumbernya.","These usually contain gelatine of unknown source."]},
  // ---- extracts ----
  {k:"vanilla", rx:/\bvanilla (extract|bean paste|paste)\b|ekstrak vanila/, not:/alcohol[- ]free|tanpa alkohol|halal/, st:"S",
    sw:[{ms:"esen vanila tanpa alkohol atau serbuk vanila, jumlah sama", en:"alcohol-free vanilla essence or vanilla powder, same amount", s:["esen vanila","vanilla essence"]}],
    why:["Ekstrak vanila tulen biasanya kira-kira 35% alkohol. Versi tanpa alkohol atau berlogo halal lebih selamat.","Pure vanilla extract is usually about 35% alcohol. An alcohol-free or halal-certified one is safer."]},
  {k:"extract", rx:/\b(almond|peppermint|mint|lemon|orange|coconut|maple|anise|coffee|rose) extracts?\b/, not:/alcohol[- ]free|tanpa alkohol|halal/, st:"S",
    sw:[{ms:"esen tanpa alkohol, jumlah sama", en:"alcohol-free essence, same amount", s:["esen tanpa alkohol","alcohol-free essence"]}],
    why:["Ekstrak perisa selalunya dilarutkan dalam alkohol.","Flavour extracts are usually dissolved in alcohol."]},
  // ---- cheese with animal rennet ----
  {k:"hardcheese", rx:/\b(parmesan|parmigiano|reggiano|pecorino|gruy[eè]re|grana padano|romano|manchego|emmental|gorgonzola|roquefort|comt[eé]|asiago)\b/, not:/halal/, st:"S",
    sw:[{ms:"keju keras berlogo halal (renet mikrob), jumlah sama", en:"halal-certified hard cheese (microbial rennet), same amount", s:["keju halal","halal cheese"]}],
    why:["Keju tradisional ini dibuat dengan renet daripada perut anak lembu yang tidak disembelih.","These traditional cheeses are made with rennet from unslaughtered calves."]},
  // ---- not halal in the Shafi'i school ----
  {k:"frog", rx:/\b(frogs?|frog legs?|katak)\b/, st:"X",
    sw:[{ms:"kepak ayam", en:"chicken wings", s:["kepak ayam","chicken wings"]}], why:["Katak haram dimakan dalam mazhab Syafi'i.","Frog is not eaten in the Shafi'i school."]},
  {k:"snail", rx:/\b(escargots?|snails?|siput babi)\b/, st:"X",
    sw:[{ms:"cendawan butang", en:"button mushrooms", s:["cendawan","mushrooms"]}], why:["Siput darat haram dimakan dalam mazhab Syafi'i.","Land snails are not eaten in the Shafi'i school."]},
  {k:"croc", rx:/\b(crocodile|alligator|turtle|buaya|penyu)\b/, st:"X",
    sw:[{ms:"peha ayam", en:"chicken thigh", s:["peha ayam","chicken thigh"]}], why:["Haiwan dua alam ini haram dalam mazhab Syafi'i.","These amphibious animals are not eaten in the Shafi'i school."]},
  {k:"blood", rx:/\b(blood|darah)\b/, not:/blood orange/, st:"X",
    sw:[{ms:"tinggalkan", en:"leave it out", s:["(tiada)","(none)"]}], why:["Darah haram dimakan.","Blood is haram to eat."]},
  // ---- tips only (halal when bought with a halal logo) ----
  {k:"stock", rx:/\b(stock cubes?|bouillon|stock powder|gravy (granules|powder|mix)|broth|stock)\b|kiub pati|serbuk perasa|\bstok\b/, st:"T",
    tip:["Pilih stok atau kiub pati berlogo halal; ia mungkin mengandungi pati daging.","Choose a halal-certified stock or cube; it may contain meat extract."]},
  {k:"meat", rx:/\b(beef|steak|veal|lamb|mutton|goat|chicken|turkey|duck|goose|venison|brisket|sirloin|ribeye|mince|minced meat|ground meat|meatballs?|burger patt(y|ies)|bone broth|oxtail|liver)\b|\b(daging|ayam|lembu|kambing|itik|biri-biri|tetel|hati)\b/, st:"T", tip:MEATT},
  {k:"cheese", rx:/\b(cheese|mozzarella|cheddar|ricotta|mascarpone|brie|camembert|feta|halloumi|paneer|gouda|provolone)\b|\bkeju\b/, not:/halal/, st:"T",
    tip:["Pilih jenama berlogo halal; sesetengah keju menggunakan renet haiwan.","Choose a halal-certified brand; some cheeses use animal rennet."]}
];
// Phrases in the method that only make sense with alcohol.
var STEP_FIX = [
  [/\b(?:carefully )?(?:flamb[eé](?:e|ed|ing)?|ignite (?:it|the (?:pan|alcohol|sauce|brandy|rum))|set (?:it )?alight|light the (?:brandy|rum|alcohol))(?![a-z\u00c0-\u024f])/gi,
    function(m, L2){ return m+" ("+L2("langkau: tiada alkohol untuk dibakar","skip this: there is no alcohol to burn")+")"; }],
  [/\b(?:until|till) (?:the )?(?:alcohol|wine|beer|brandy|rum|liquor|sake|mirin)[\w ]{0,24}?(?:cooks?|burns?|burned|burnt|evaporat\w*|boils?)(?: off| away)?/gi,
    function(m, L2){ return L2("sehingga sedikit pekat","until slightly reduced"); }],
  [/\bsehingga alkohol (?:hilang|tersejat|meruap)\b/gi, function(){ return "sehingga sedikit pekat"; }]
];
window.RECIPE_SUBS = {SUBS:SUBS, STEP_FIX:STEP_FIX, version:"2026-11-08"};
})();
