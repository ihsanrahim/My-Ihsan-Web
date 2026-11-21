/* My Ihsan 0.6.61 · World News: countries. "CC|English|Malay|region|oic|editions" — editions are Google News hl:lang pairs
   (e.g. "ms:ms,en:en" for Malaysia); a country without an edition still gets headlines ABOUT it (Google News search, English or Arabic).
   region: as Asia, me Middle East, eu Europe, af Africa, am Americas, oc Oceania. */
(function(){
"use strict";
var RAW = [
 "MY|Malaysia|Malaysia|as|1|ms:ms,en:en","ID|Indonesia|Indonesia|as|1|id:id,en:en","BN|Brunei|Brunei|as|1|","SG|Singapore|Singapura|as|0|en:en","TH|Thailand|Thailand|as|0|th:th","PH|Philippines|Filipina|as|0|en:en","VN|Vietnam|Vietnam|as|0|vi:vi",
 "KH|Cambodia|Kemboja|as|0|","MM|Myanmar|Myanmar|as|0|","LA|Laos|Laos|as|0|","TL|Timor-Leste|Timor Leste|as|0|","CN|China|China|as|0|zh-Hans:zh-Hans","HK|Hong Kong|Hong Kong|as|0|zh-HK:zh-Hant,en:en","TW|Taiwan|Taiwan|as|0|zh-TW:zh-Hant","JP|Japan|Jepun|as|0|ja:ja","KR|South Korea|Korea Selatan|as|0|ko:ko",
 "IN|India|India|as|0|en:en,hi:hi,ta:ta,ml:ml","PK|Pakistan|Pakistan|as|1|en:en","BD|Bangladesh|Bangladesh|as|1|bn:bn","LK|Sri Lanka|Sri Lanka|as|0|","NP|Nepal|Nepal|as|0|","MV|Maldives|Maldives|as|1|","AF|Afghanistan|Afghanistan|as|1|",
 "KZ|Kazakhstan|Kazakhstan|as|1|","UZ|Uzbekistan|Uzbekistan|as|1|","KG|Kyrgyzstan|Kyrgyzstan|as|1|","TJ|Tajikistan|Tajikistan|as|1|","TM|Turkmenistan|Turkmenistan|as|1|","AZ|Azerbaijan|Azerbaijan|as|1|","MN|Mongolia|Mongolia|as|0|",
 "SA|Saudi Arabia|Arab Saudi|me|1|ar:ar","AE|United Arab Emirates|Emiriah Arab Bersatu|me|1|ar:ar,en:en","QA|Qatar|Qatar|me|1|","KW|Kuwait|Kuwait|me|1|","BH|Bahrain|Bahrain|me|1|","OM|Oman|Oman|me|1|","YE|Yemen|Yaman|me|1|",
 "PS|Palestine|Palestin|me|1|","JO|Jordan|Jordan|me|1|","LB|Lebanon|Lubnan|me|1|ar:ar","SY|Syria|Syria|me|1|","IQ|Iraq|Iraq|me|1|","IR|Iran|Iran|me|1|","TR|Türkiye|Turkiye|me|1|tr:tr","EG|Egypt|Mesir|af|1|ar:ar","IL|Israel|Israel|me|0|en:en,he:he",
 "MA|Morocco|Maghribi|af|1|fr:fr","DZ|Algeria|Algeria|af|1|","TN|Tunisia|Tunisia|af|1|","LY|Libya|Libya|af|1|","SD|Sudan|Sudan|af|1|","MR|Mauritania|Mauritania|af|1|","SO|Somalia|Somalia|af|1|","DJ|Djibouti|Djibouti|af|1|","KM|Comoros|Comoros|af|1|",
 "NG|Nigeria|Nigeria|af|1|en:en","SN|Senegal|Senegal|af|1|fr:fr","ML|Mali|Mali|af|1|","NE|Niger|Niger|af|1|","TD|Chad|Chad|af|1|","BF|Burkina Faso|Burkina Faso|af|1|","GN|Guinea|Guinea|af|1|","GM|Gambia|Gambia|af|1|","SL|Sierra Leone|Sierra Leone|af|1|",
 "CI|Côte d'Ivoire|Pantai Gading|af|1|","CM|Cameroon|Cameroon|af|1|","GA|Gabon|Gabon|af|1|","BJ|Benin|Benin|af|1|","TG|Togo|Togo|af|1|","UG|Uganda|Uganda|af|1|en:en","MZ|Mozambique|Mozambique|af|1|","GW|Guinea-Bissau|Guinea-Bissau|af|1|",
 "KE|Kenya|Kenya|af|0|en:en","TZ|Tanzania|Tanzania|af|0|en:en","ET|Ethiopia|Ethiopia|af|0|en:en","GH|Ghana|Ghana|af|0|en:en","ZA|South Africa|Afrika Selatan|af|0|en:en","ZW|Zimbabwe|Zimbabwe|af|0|en:en","NA|Namibia|Namibia|af|0|en:en","BW|Botswana|Botswana|af|0|en:en","RW|Rwanda|Rwanda|af|0|",
 "AL|Albania|Albania|eu|1|","BA|Bosnia and Herzegovina|Bosnia dan Herzegovina|eu|0|","XK|Kosovo|Kosovo|eu|0|","GB|United Kingdom|United Kingdom|eu|0|en:en","IE|Ireland|Ireland|eu|0|en:en","FR|France|Perancis|eu|0|fr:fr","DE|Germany|Jerman|eu|0|de:de","NL|Netherlands|Belanda|eu|0|nl:nl",
 "BE|Belgium|Belgium|eu|0|fr:fr,nl:nl","CH|Switzerland|Switzerland|eu|0|de:de,fr:fr","AT|Austria|Austria|eu|0|de:de","IT|Italy|Itali|eu|0|it:it","ES|Spain|Sepanyol|eu|0|es:es","PT|Portugal|Portugal|eu|0|pt-PT:pt-150","SE|Sweden|Sweden|eu|0|sv:sv","NO|Norway|Norway|eu|0|no:no",
 "DK|Denmark|Denmark|eu|0|","FI|Finland|Finland|eu|0|","PL|Poland|Poland|eu|0|pl:pl","CZ|Czechia|Czech|eu|0|cs:cs","SK|Slovakia|Slovakia|eu|0|sk:sk","HU|Hungary|Hungary|eu|0|hu:hu","RO|Romania|Romania|eu|0|ro:ro","BG|Bulgaria|Bulgaria|eu|0|bg:bg","GR|Greece|Greece|eu|0|el:el",
 "RS|Serbia|Serbia|eu|0|sr:sr","SI|Slovenia|Slovenia|eu|0|sl:sl","LV|Latvia|Latvia|eu|0|lv:lv","LT|Lithuania|Lithuania|eu|0|lt:lt","UA|Ukraine|Ukraine|eu|0|uk:uk","RU|Russia|Rusia|eu|0|ru:ru",
 "US|United States|Amerika Syarikat|am|0|en-US:en,es-419:es-419","CA|Canada|Kanada|am|0|en:en,fr:fr","MX|Mexico|Mexico|am|0|es-419:es-419","BR|Brazil|Brazil|am|0|pt-BR:pt-419","AR|Argentina|Argentina|am|0|es-419:es-419","CL|Chile|Chile|am|0|es-419:es-419",
 "CO|Colombia|Colombia|am|0|es-419:es-419","PE|Peru|Peru|am|0|es-419:es-419","VE|Venezuela|Venezuela|am|0|es-419:es-419","CU|Cuba|Cuba|am|0|es-419:es-419","GY|Guyana|Guyana|am|1|","SR|Suriname|Suriname|am|1|",
 "AU|Australia|Australia|oc|0|en:en","NZ|New Zealand|New Zealand|oc|0|en:en","FJ|Fiji|Fiji|oc|0|"];
var C = RAW.map(function(r){ var p = r.split("|"); return {cc:p[0], en:p[1], ms:p[2], reg:p[3], oic:p[4] === "1", ed:p[5] ? p[5].split(",").map(function(x){ var q = x.split(":"); return {hl:q[0], ce:q[1]}; }) : []}; });
var REG = [["as","Asia","Asia"],["me","Timur Tengah","Middle East"],["af","Afrika","Africa"],["eu","Eropah","Europe"],["am","Amerika","Americas"],["oc","Oceania","Oceania"]];
// language codes of an edition → the app's TTS language and a display label
var LANG = {ms:["ms","BM"], en:["en","EN"], "en-US":["en","EN"], id:["id","ID"], ar:["ar","عربي"], fr:["fr","FR"], de:["de","DE"], tr:["tr","TR"], bn:["bn","বাংলা"], hi:["hi","हिंदी"], ta:["ta","தமிழ்"], ml:["ml","മലയാളം"], es:["es","ES"], "es-419":["es","ES"], it:["it","IT"], nl:["nl","NL"], ja:["ja","日本語"], ko:["ko","한국어"], th:["th","ไทย"], vi:["vi","VI"], ru:["ru","RU"], uk:["uk","UA"], he:["he","HE"]};
// Malaysian papers (owner: the Malaysian list): Google News "site:" search feeds, newest first
var PAPERS = {MY:[["Berita Harian","bharian.com.my","ms"],["Harian Metro","hmetro.com.my","ms"],["Utusan Malaysia","utusan.com.my","ms"],["Kosmo!","kosmo.com.my","ms"],["Sinar Harian","sinarharian.com.my","ms"],["Bernama","bernama.com","ms"],["The Star","thestar.com.my","en"],["New Straits Times","nst.com.my","en"],["Free Malaysia Today","freemalaysiatoday.com","en"],["Malay Mail","malaymail.com","en"]]};
// Ummah tab (owner: + Iran, Yemen, Syria, Lebanon)
var UMMAH = "(Palestine OR Gaza OR \"West Bank\" OR Rohingya OR Uyghur OR OIC OR Hajj OR Umrah OR Iran OR Yemen OR Syria OR Lebanon OR Muslim OR Islam)";
var UMMAH_MS = "(Palestin OR Gaza OR Rohingya OR Uighur OR OIC OR haji OR umrah OR Iran OR Yaman OR Syria OR Lubnan OR Islam OR Muslim)";
window.NewsData = {C:C, REG:REG, LANG:LANG, PAPERS:PAPERS, UMMAH:UMMAH, UMMAH_MS:UMMAH_MS};
})();
