package com.example.appearnar2;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.myWebView);
        
        // تفعيل الإعدادات الهامة لتشغيل كود جلب المنتجات
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true); // تفعيل الجافا سكريبت لقراءة الـ XML
        webSettings.setDomStorageEnabled(true); // تفعيل التخزين المؤقت للملف الضخم
        webSettings.setAllowFileAccess(true);

        // كود الـ HTML والـ JavaScript المدمج به روابط حسابك وسيرفر جلب المنتجات
        String htmlCode = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>متجر علي إكسبريس المميز</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
        body { background-color: #f5f5f7; color: #333; padding: 15px; }
        header { background: linear-gradient(135deg, #ff4747, #ff7e47); color: white; padding: 20px; text-align: center; border-radius: 12px; margin-bottom: 20px; }
        header h1 { font-size: 20px; margin-bottom: 5px; }
        header p { font-size: 13px; opacity: 0.9; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        .product-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #eee; padding: 10px; }
        .product-img-container { width: 100%; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
        .product-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .product-title { font-size: 12px; font-weight: bold; line-height: 1.4; height: 34px; overflow: hidden; margin-bottom: 6px; color: #444; }
        .product-price { font-size: 15px; color: #ff4747; font-weight: 800; margin-bottom: 8px; }
        .buy-btn { background-color: #ff4747; color: white; text-align: center; padding: 8px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: bold; display: block; }
        #loading { text-align: center; padding: 30px; font-size: 15px; color: #666; }
        .error-msg { text-align: center; color: #ff4747; padding: 20px; }
    </style>
</head>
<body>
    <header>
        <h1>أقوى العروض والمنتجات الساخنة</h1>
        <p>تسوق أفضل منتجات علي إكسبريس بأقل الأسعار</p>
    </header>
    <div id="loading">جاري تحميل المنتجات الذكية...</div>
    <div class="products-grid" id="products-container"></div>
    <script>
        const xmlUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent("http://export.admitad.com/en/webmaster/websites/2959524/products/export_adv_products/?user=hamza_benlhocenecbef&code=wd1n174woy&feed_id=15830&format=xml&fcid=6115");
        async function fetchProducts() {
            try {
                const response = await fetch(xmlUrl);
                if (!response.ok) throw new Error('Network error');
                const textData = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(textData, "text/xml");
                const offers = xmlDoc.getElementsByTagName("offer");
                const container = document.getElementById("products-container");
                document.getElementById("loading").style.display = "none";
                if(offers.length === 0) {
                    container.innerHTML = "<p class='error-msg'>لا توجد منتجات متاحة حالياً.</p>";
                    return;
                }
                const maxProducts = Math.min(offers.length, 100);
                for (let i = 0; i < maxProducts; i++) {
                    const offer = offers[i];
                    const name = offer.getElementsByTagName("name")[0]?.textContent || "منتج مميز";
                    const picture = offer.getElementsByTagName("picture")[0]?.textContent || "";
                    const price = offer.getElementsByTagName("price")[0]?.textContent || "";
                    const currency = offer.getElementsByTagName("currencyId")[0]?.textContent || "USD";
                    const affiliateUrl = offer.getElementsByTagName("url")[0]?.textContent || "https://rzekl.com/g/1e8d114494115aeb5a6816525dc3e8/";
                    const card = document.createElement("div");
                    card.className = "product-card";
                    card.innerHTML = `
                        <div class="product-img-container">
                            <img class="product-img" src="${picture}" loading="lazy">
                        </div>
                        <div class="product-title">${name}</div>
                        <div class="product-price">${price} ${currency}</div>
                        <a href="${affiliateUrl}" class="buy-btn">شراء الآن</a>
                    `;
                    container.appendChild(card);
                }
            } catch (error) {
                document.getElementById("loading").style.display = "none";
                document.getElementById("products-container").innerHTML = "<p class='error-msg'>حدث خطأ أثناء تحميل المنتجات.</p>";
            }
        }
        fetchProducts();
    </script>
</body>
</html>
""";

        // تشغيل الكود مباشرة داخل التطبيق
        webView.loadDataWithBaseURL(null, htmlCode, "text/html", "UTF-8", null);

        // التحكم في الضغط على الروابط (أزرار الشراء بالأفلييت)
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // إذا ضغط المستخدم على زر الشراء، يتم فتح رابط الأفلييت في متصفح الهاتف الخارجي فوراً لاحتساب عمولتك
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                return false;
            }
        });
    }

    // تفعيل زر الرجوع للخلف في الهاتف بدلاً من إغلاق التطبيق فوراً
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
