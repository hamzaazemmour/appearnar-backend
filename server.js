const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');

const app = express();
app.use(cors());

// رابط الـ XML الخاص بك مباشرة
const XML_URL = "http://export.admitad.com/en/webmaster/websites/2959524/products/export_adv_products/?user=hamza_benlhocenecbef&code=wd1n174woy&feed_id=15830&format=xml&fcid=6115";

app.get('/api/products', async (req, res) => {
    try {
        // جلب البيانات من ملف الـ XML مباشرة دون الحاجة لـ Token (يتفادى خطأ 401)
        const response = await axios.get(XML_URL);
        
        // تحويل الـ XML إلى JSON
        xml2js.parseString(response.data, (err, result) => {
            if (err) {
                return res.status(500).json({ error: "خطأ في تحليل البيانات" });
            }
            
            // استخراج العروض
            const offers = result.vxml.shop[0].offers[0].offer || [];
            
            // نأخذ أول 100 منتج لتخفيف الضغط
            const limitedOffers = offers.slice(0, 100).map(offer => ({
                name: offer.name ? offer.name[0] : "منتج مميز",
                picture: offer.picture ? offer.picture[0] : "",
                price: offer.price ? offer.price[0] : "",
                currency: offer.currencyId ? offer.currencyId[0] : "USD",
                url: offer.url ? offer.url[0] : "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
            }));

            res.json(limitedOffers);
        });
    } catch (error) {
        console.error("خطأ السيرفر:", error.message);
        res.status(500).json({ error: "فشل الاتصال بـ Admitad" });
    }
});

// التعديل السحابي هنا: يقرأ المنفذ المخصص من الاستضافة أو يستخدم 3000 محلياً
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر الخلفي يعمل بنجاح على المنفذ ${PORT}`);
});
