const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
app.use(cors());
app.use(express.json());

const ADMITAD_XML_FEED = "http://export.admitad.com/en/webmaster/websites/2959524/products/export_adv_products/?user=hamza_benlhocenecbef&code=wd1n174woy&feed_id=15830&format=xml&fcid=6115";

// قائمة منتجات ذكية وجاهزة للعمل فوراً كخطة أساسية وسريعة للتطبيق
const staticProducts = [
    {
        id: "ali_101",
        title: "سماعات بلوتوث Lenovo LP40 Pro اللاسلكية الأصلية",
        price: "12.50 USD",
        image: "https://images.unsplash.com/photo-1606220532402-13a1e8223946?w=500",
        affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
    },
    {
        id: "ali_102",
        title: "ساعة ذكية Smart Watch مقاومة للماء مع شاشة أموليد",
        price: "24.99 USD",
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500",
        affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
    },
    {
        id: "ali_103",
        title: "شاحن سريع Baseus 65W GaN لأجهزة الأندرويد والآيفون",
        price: "19.99 USD",
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500",
        affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
    }
];

app.get('/api/products', async (req, res) => {
    // نضع مهلة زمنية قصيرة (3 ثوانٍ فقط) لطلب Admitad، إذا علق نلغيه فوراً ونعرض المنتجات السريعة
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
        source.cancel('Timeout');
    }, 3000);

    try {
        const response = await axios.get(ADMITAD_XML_FEED, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cancelToken: source.token
        });
        
        clearTimeout(timeout); // إلغاء المهلة لنجاح الطلب سريعاً

        xml2js.parseString(response.data, { explicitArray: false, mergeAttrs: true }, (err, result) => {
            if (err) throw new Error("Parsing failed");

            const offers = result?.yml_catalog?.shop?.offers?.offer || [];
            const itemsArray = Array.isArray(offers) ? offers : [offers];
            
            if (itemsArray.length === 0 || !itemsArray[0]) {
                return res.json({ success: true, live: false, products: staticProducts });
            }

            const products = itemsArray.map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                title: item.name || item.model || "AliExpress Product",
                price: `${item.price || ""} ${item.currencyId || "USD"}`,
                image: Array.isArray(item.picture) ? item.picture[0] : (item.picture || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"),
                affiliate_url: item.url || "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
            })).slice(0, 30);

            res.json({ success: true, live: true, count: products.length, products: products });
        });

    } catch (error) {
        clearTimeout(timeout);
        // في حال التعليق أو الحظر، نرسل المنتجات الجاهزة فوراً بلمح البصر (0.1 ثانية) لكي لا تعلق الشاشة
        res.json({
            success: true,
            live: false,
            message: "Loaded instant products optimized for fast loading",
            products: staticProducts
        });
    }
});

app.get('/', (req, res) => {
    res.send("AppEarnAr Backend is running successfully!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
