const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
app.use(cors());
app.use(express.json());

// رابط الـ XML الخاص بك من Admitad لجلب منتجات AliExpress
const ADMITAD_XML_FEED = "http://export.admitad.com/en/webmaster/websites/2959524/products/export_adv_products/?user=hamza_benlhocenecbef&code=wd1n174woy&feed_id=15830&format=xml&fcid=6115";

app.get('/api/products', async (req, res) => {
    try {
        // 1. جلب بيانات المنتجات من Admitad
        const response = await axios.get(ADMITAD_XML_FEED);
        
        // 2. تحويل الـ XML إلى كود JSON بسيط ليفهمه تطبيق الأندرويد
        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Error parsing XML feed" });
            }

            // قراءة قائمة المنتجات من هيكلة الملف (تعتمد على تنسيق Admitad)
            // عادة تكون داخل result.yml_catalog.shop.offers.offer أو ما يشابهها
            const offers = result?.yml_catalog?.shop?.offers?.offer || [];
            
            // ترتيب البيانات لتكون نظيفة وخفيفة للتطبيق
            const products = (Array.isArray(offers) ? offers : [offers]).map(item => ({
                id: item.$.id || "",
                title: item.name || item.model || "AliExpress Product",
                price: `${item.price || ""} ${item.currencyId || "USD"}`,
                image: item.picture || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", // صورة افتراضية إن لم تتوفر
                affiliate_url: item.url || "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/" // رابط عمولتك الافتراضي
            })).slice(0, 50); // جلب أول 50 منتجاً لتسريع التطبيق

            res.json({
                success: true,
                count: products.length,
                products: products
            });
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
