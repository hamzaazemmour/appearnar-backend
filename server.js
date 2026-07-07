const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
app.use(cors());
app.use(express.json());

const ADMITAD_XML_FEED = "http://export.admitad.com/en/webmaster/websites/2959524/products/export_adv_products/?user=hamza_benlhocenecbef&code=wd1n174woy&feed_id=15830&format=xml&fcid=6115";

const staticProducts = {
    men: [
        {
            id: "m1",
            title: "تيشيرت قطني رجالي أنيق",
            price: "15.00 USD",
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
            affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1005005886367353.html"
        },
        {
            id: "m2",
            title: "حذاء رياضي مريح للرجال",
            price: "35.00 USD",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1005006093845012.html"
        },
        {
            id: "m3",
            title: "قميص كلاسيكي رجالي فاخر",
            price: "30.00 USD",
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
            affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1005005187123984.html"
        },
        {
            id: "m4",
            title: "ساعة يد كلاسيكية للرجال",
            price: "85.00 USD",
            image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500",
            affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1005006129845719.html"
        }
    ],
    women: [
        {
            id: "w1",
            title: "فستان صيفي أنيق",
            price: "25.00 USD",
            image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500",
            affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1005005928123948.html"
        },
        {
            id: "w2",
            title: "حقيبة يد جلدية فاخرة للنساء",
            price: "45.00 USD",
            image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
            affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1005005938401293.html"
        },
        {
            id: "w3",
            title: "نظارات شمسية عصرية للنساء",
            price: "18.00 USD",
            image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
            affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1005005829384712.html"
        },
        {
            id: "w4",
            title: "حذاء نسائي أنيق ذو كعب عالٍ",
            price: "50.00 USD",
            image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500",
            affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/?ulp=https%3A%2F%2Fwww.aliexpress.com%2Fitem%2F1005006012984712.html"
        }
    ]
};

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

            const men = [];
            const women = [];

            itemsArray.forEach(item => {
                const product = {
                    id: item.id || Math.random().toString(36).substr(2, 9),
                    title: item.name || item.model || "AliExpress Product",
                    price: `${item.price || ""} ${item.currencyId || "USD"}`,
                    image: Array.isArray(item.picture) ? item.picture[0] : (item.picture || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"),
                    affiliate_url: item.url || "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
                };

                const text = (product.title + " " + (item.description || "")).toLowerCase();
                if (text.includes("women") || text.includes("woman") || text.includes("girl") || text.includes("نسائي") || text.includes("فستان") || text.includes("حريمي") || text.includes("بنات")) {
                    women.push(product);
                } else {
                    men.push(product);
                }
            });

            res.json({
                success: true,
                live: true,
                count: men.length + women.length,
                products: {
                    men: men.slice(0, 20),
                    women: women.slice(0, 20)
                }
            });
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
