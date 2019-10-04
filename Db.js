/*jshint esversion: 6 */
var xl = require('excel4node');
const PgPool = require('pg').Pool;
const pgPool = new PgPool({
    user: 'u_api',
    host: 'localhost',
    database: 'db_api',
    password: 'şifremmmm',
    port: 5432,
});

const KullanicilariGetir = (request, response) => {
    pgPool.query('SELECT * FROM Kullanicilar ORDER BY OKytNo ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const KullanicilariGetirXlsx = (request, response) => {
    pgPool.query('SELECT * FROM Kullanicilar ORDER BY OKytNo ASC', (error, results) => {
        if (error) {
            throw error;
        }
        var wb = new xl.Workbook({
            jszip: {
                compression: 'DEFLATE',
            },
            defaultFont: {
                size: 12,
                name: 'Calibri',
                color: '000000',
            },
            dateFormat: 'mm.dd.yyyy hh:mm:ss',
            workbookView: {
                activeTab: 1, // Specifies an unsignedInt that contains the index to the active sheet in this book view.
                autoFilterDateGrouping: true, // Specifies a boolean value that indicates whether to group dates when presenting the user with filtering options in the user interface.
                firstSheet: 1, // Specifies the index to the first sheet in this book view.
                minimized: false, // Specifies a boolean value that indicates whether the workbook window is minimized.
                showHorizontalScroll: true, // Specifies a boolean value that indicates whether to display the horizontal scroll bar in the user interface.
                showSheetTabs: true, // Specifies a boolean value that indicates whether to display the sheet tabs in the user interface.
                showVerticalScroll: true, // Specifies a boolean value that indicates whether to display the vertical scroll bar.
                tabRatio: 600, // Specifies ratio between the workbook tabs bar and the horizontal scroll bar.
                visibility: 'visible', // Specifies visible state of the workbook window. ('hidden', 'veryHidden', 'visible') (§18.18.89)
                windowHeight: 17620, // Specifies the height of the workbook window. The unit of measurement for this value is twips.
                windowWidth: 28800, // Specifies the width of the workbook window. The unit of measurement for this value is twips..
                xWindow: 0, // Specifies the X coordinate for the upper left corner of the workbook window. The unit of measurement for this value is twips.
                yWindow: 440, // Specifies the Y coordinate for the upper left corner of the workbook window. The unit of measurement for this value is twips.
            },
            logLevel: 0, // 0 - 5. 0 suppresses all logs, 1 shows errors only, 5 is for debugging
            author: 'Hasan Hüseyin KOCA', // Name for use in features such as comments
        });
        var ws = wb.addWorksheet('Sheet 1');
        var styleBaslik = wb.createStyle({
            font: {
                bold: true,
                color: '#0000CC',
                size: 14,
            }
        });
        var styleSatir = wb.createStyle({
            font: {
                size: 12,
            },
            numberFormat: '$#,##0.00; ($#,##0.00); -',
        });
        let sagaHizalanmis = wb.createStyle({
            font: {
                bold: true
            },
            alignment: {
                wrapText: true,
                horizontal: 'right',
            }
        });
        let satirNo = 2;
        ws.column(1).setWidth(8);
        ws.column(2).setWidth(15);
        ws.column(3).setWidth(15);
        ws.column(4).setWidth(30);
        ws.cell(1, 1).string('S.No').style(styleBaslik);
        ws.cell(1, 2).string('İsim').style(styleBaslik);
        ws.cell(1, 3).string('Soyisim').style(styleBaslik);
        ws.cell(1, 4).string('Mail Adresi').style(styleBaslik);

        results.rows.forEach(kullanici => {
            ws.cell(satirNo, 1).string((satirNo - 1) + '.').style(sagaHizalanmis);
            ws.cell(satirNo, 2).string(kullanici.isim).style(styleSatir);
            ws.cell(satirNo, 3).string(kullanici.soyisim).style(styleSatir);
            ws.cell(satirNo, 4).string(kullanici.email).style(styleSatir);
            satirNo++;
        });
        wb.write('Kullanıcılar.xlsx', response);
    });
};

const KullaniciyiGetir = (request, response) => {
    const OKytNo = parseInt(request.params.OKytNo);

    pgPool.query('SELECT * FROM Kullanicilar WHERE OKytNo = $1', [OKytNo], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const KullaniciOlustur = (request, response) => {
    const {
        Isim,
        Soyisim,
        Email
    } = request.body;

    pgPool.query('INSERT INTO Kullanicilar (Isim, Soyisim, Email) VALUES($1, $2, $3)', [Isim, Soyisim, Email])
        .then(res => {
            response.status(201).send(res);
        })
        .catch(e => console.error(e.stack));
};

const KullaniciyiGuncelle = (request, response) => {
    const OKytNo = parseInt(request.params.OKytNo);
    const {
        Isim,
        Soyisim,
        Email
    } = request.body;

    pgPool.query(
        'UPDATE Kullanicilar SET Isim = $1, Soyisim = $2, Email = $3 WHERE OKytNo = $4',
        [Isim, Soyisim, Email, OKytNo],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`Kullunici güncellendi, OKytNo : ${OKytNo}`);
        }
    );
};

const KullaniciyiSil = (request, response) => {
    const OKytNo = parseInt(request.params.OKytNo);

    pgPool.query('DELETE FROM Kullanicilar WHERE OKytNo = $1', [OKytNo], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Kullanıcı kaydı silindi, OKytNo: ${OKytNo}`);
    });
};

module.exports = {
    KullanicilariGetir,
    KullanicilariGetirXlsx,
    KullaniciyiGetir,
    KullaniciOlustur,
    KullaniciyiGuncelle,
    KullaniciyiSil
};