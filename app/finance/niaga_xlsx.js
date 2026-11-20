/* My Ihsan 0.6.26 · a tiny .xlsx writer (no library): NiagaXlsx([[sheetName, rows], …]) → base64.
   Cells: string, number, {d:"YYYY-MM-DD"} (a real Excel date), "" empty. Bold header row, frozen. ZIP "stored" with CRC-32. */
(function(){ "use strict";
var CRC = (function(){ var t = []; for(var n = 0; n < 256; n++){ var c = n; for(var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc(b){ var c = 0xFFFFFFFF; for(var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function u8(s){ return new TextEncoder().encode(s); }
function x(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""); }
function col(i){ var s = ""; i++; while(i){ var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
function serial(d){ var p = d.split("-"); return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(1899, 11, 30)) / 864e5); }
function sheet(rows){ var w = [];
  rows.forEach(function(r){ r.forEach(function(v, j){ var n = v && v.d ? 11 : String(v == null ? "" : v).length; w[j] = Math.min(60, Math.max(w[j] || 8, n + 2)); }); });
  var out = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' +
    w.map(function(v, j){ return '<col min="' + (j + 1) + '" max="' + (j + 1) + '" width="' + v + '" customWidth="1"/>'; }).join("") + '</cols><sheetData>';
  rows.forEach(function(r, i){ out += '<row r="' + (i + 1) + '">'; r.forEach(function(v, j){ var ref = col(j) + (i + 1);
      if(v === "" || v == null) return; if(v && v.d){ out += '<c r="' + ref + '" s="2"><v>' + serial(v.d) + '</v></c>'; return; }
      if(typeof v === "number" && isFinite(v)){ out += '<c r="' + ref + '"' + (i ? ' s="3"' : '') + '><v>' + v + '</v></c>'; return; }
      out += '<c r="' + ref + '" t="inlineStr"' + (i ? '' : ' s="1"') + '><is><t xml:space="preserve">' + x(v) + '</t></is></c>'; }); out += '</row>'; });
  return out + '</sheetData></worksheet>'; }
function zip(files){ var parts = [], cen = [], off = 0;
  files.forEach(function(f){ var name = u8(f[0]), data = u8(f[1]), c = crc(data), h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 0, true); h.setUint32(14, c, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    var e = new DataView(new ArrayBuffer(46)); e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint32(16, c, true); e.setUint32(20, data.length, true); e.setUint32(24, data.length, true); e.setUint16(28, name.length, true); e.setUint32(42, off, true);
    cen.push(new Uint8Array(e.buffer), name); off += 30 + name.length + data.length; });
  var cs = cen.reduce(function(s, a){ return s + a.length; }, 0), end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cs, true); end.setUint32(16, off, true);
  var all = parts.concat(cen, [new Uint8Array(end.buffer)]), len = all.reduce(function(s, a){ return s + a.length; }, 0), buf = new Uint8Array(len), p = 0; all.forEach(function(a){ buf.set(a, p); p += a.length; });
  var s = ""; for(var i = 0; i < buf.length; i += 32768) s += String.fromCharCode.apply(null, buf.subarray(i, i + 32768)); return btoa(s); }
window.NiagaXlsx = function(sheets){ var ws = sheets.map(function(s, i){ return ["xl/worksheets/sheet" + (i + 1) + ".xml", sheet(s[1])]; });
  return zip([["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      sheets.map(function(s, i){ return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join("") + '</Types>'],
    ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ["xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + sheets.map(function(s, i){ return '<sheet name="' + x(String(s[0]).slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join("") + '</sheets></workbook>'],
    ["xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map(function(s, i){ return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join("") + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ["xl/styles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs>' +
      '<cellXfs count="4"><xf/><xf fontId="1" applyFont="1"/><xf numFmtId="164" applyNumberFormat="1"/><xf numFmtId="4" applyNumberFormat="1"/></cellXfs></styleSheet>']].concat(ws)); };
})();
