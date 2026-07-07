const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
app.use(cors());
app.use(express.json());

const ADMITAD_XML_FEED = "http://export.admitad.com/en/webmaster/websites/2959524/products/export_adv_products/?user=hamza_benlhocenecbef&code=wd1n174woy&feed_id=15830&format=xml&fcid=6115";

app.get('/api/products', async (req, res) => {
    try {
        // جلب البيانات مع إضافة User-Agent لتجنب حظر السيرفرات
        const response = await axios.get(ADMITAD_XML_FEED, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000 // مهلة 10 ثوانٍ للاتصال
        });
        
        xml2js.parseString(response.data, { explicitArray: false, mergeAttrs: true }, (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Error parsing XML feed", error: err.message });
            }

            // فحص مرن وتدريجي لهيكلة ملف Admitad لتجنب الانهيار
            const catalog = result?.yml_catalog || result?.feed;
            const shop = catalog?.shop;
            const offersContainer = shop?.offers;
            const offers = offersContainer?.offer || [];
            
            // تحويل البيانات بشكل آمن
            const itemsArray = Array.isArray(offers) ? offers : [offers];
            
            const products = itemsArray.filter(item => item).map(item => {
                // جلب الصورة بشكل آمن (قد تكون نصاً مباشرًا أو مصفوفة)
                let image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500";
                if (item.picture) {
                    image = Array.isArray(item.picture) ? item.picture[0] : item.picture;
                }

                return {
                    id: item.id || Math.random().toString(36).substr(2, 9),
                    title: item.name || item.model || "AliExpress Product",
                    price: `${item.price || ""} ${item.currencyId || "USD"}`,
                    image: image,
                    affiliate_url: item.url || "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
                };
            }).slice(0, 50); // جلب أول 50 منتجاً فقط لتسريع الأداء

            res.json({
                success: true,
                count: products.length,
                products: products
            });
        });

    } catch (error) {
        // في حال فشل جلب الـ XML، نرسل منتجات احتياطية كخطة بديلة (Fallback) حتى لا يعلق التطبيق
        res.json({
            success: true,
            fallback: true,
            message: "Showing fallback products due to feed timeout",
            products: [
                {
                    id: "fb1",
                    title: "سماعات بلوتوث لاسلكية ذكية عالية الجودة - AliExpress",
                    price: "15.99 USD",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                    affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
                },
                {
                    id: "fb2",
                    title: "ساعة يد ذكية مقاومة للماء مع مستشعر نبضات - AliExpress",
                    price: "29.49 USD",
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                    affiliate_url: "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/"
                }
            ]
        });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
