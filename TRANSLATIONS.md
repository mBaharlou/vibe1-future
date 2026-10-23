# Translations

Every user-visible string, in all three languages, for native-speaker review. Source files:
`src/locales/en.json`, `tr.json`, `fa.json` (same keys; a missing key is a TypeScript error).
The JSON files are what the site uses; update this table when you change them.

Not translated on purpose: the **JOINT** wordmark, the owner's name in the top bar
(Mohammad Baharlou), and the language names in the switcher, which always show in their own
language (English, Türkçe, فارسی).

## Please review

- `meta.homeTitle`: tr "joint'im" and fa "جوینت من" (my joint) are informal, like the English.
- `pages.products.description` (tr): "Joint'ler ve sigaralar" keeps "joint" as a loanword.
- `pages.vapes.title` (tr): "Vape'ler" as given; "elektronik sigaralar" is the formal alternative.
- `joint.ariaLabel` (tr): "{{title}} sayfasını aç" reads "open the {{title}} page"; check it reads
  well with "Ben" ("Ben sayfasını aç").
- `me.*` and `contactPage.*`: written in first person from my portfolio; check the tr/fa tone
  sounds natural, not translated.
- `shop.items.*` (the 16 added on 2026-10-24, e.g. `coral-crush`, `lava-berry`): tr/fa names are
  free renderings ("Mercan Şöleni", "شور مرجانی"), not literal.
- `contactPage.languages` keeps the three language names in their own scripts on purpose.

- `shop.items.*`: product names are translated (tr/fa), not kept as English brand names;
  check they still sound like product names. fa uses جوینت for joint, as in the chat.
- `shop.note` (fa): "۱۸+" uses Persian digits.

## All keys

| Key | English | Türkçe | فارسی |
| --- | --- | --- | --- |
| `meta.homeTitle` | my joint | joint'im | <span dir="rtl">جوینت من</span> |
| `meta.pageTitle` | {{title}} · JOINT | {{title}} · JOINT | <span dir="rtl">{{title}} · JOINT</span> |
| `meta.notFoundTitle` | Not found | Sayfa bulunamadı | <span dir="rtl">صفحه پیدا نشد</span> |
| `topBar.github` | {{name}} on GitHub (opens in a new tab) | GitHub'da {{name}} (yeni sekmede açılır) | <span dir="rtl">{{name}} در گیت‌هاب (در زبانهٔ جدید باز می‌شود)</span> |
| `hero.subtitle` | Make your dreams colorful | Hayallerini renklendir | <span dir="rtl">رویاهایت را رنگی کن</span> |
| `hero.catAlt` | Tabby cat in a sunny field | Güneşli bir çayırda tekir kedi | <span dir="rtl">گربهٔ ببری در یک چمنزار آفتابی</span> |
| `pages.me.title` | Me | Ben | <span dir="rtl">من</span> |
| `pages.me.description` | Frontend developer & UI-focused creator | Frontend geliştirici ve arayüz odaklı üretici | <span dir="rtl">توسعه‌دهندهٔ فرانت‌اند و سازنده‌ای متمرکز بر رابط کاربری</span> |
| `pages.products.title` | Joint | Joint | <span dir="rtl">جوینت</span> |
| `pages.products.description` | Joints & cigarettes | Joint'ler ve sigaralar | <span dir="rtl">جوینت و سیگار</span> |
| `pages.vapes.title` | Vapes | Vape'ler | <span dir="rtl">ویپ‌ها</span> |
| `pages.vapes.description` | Devices & flavors | Cihazlar ve aromalar | <span dir="rtl">دستگاه‌ها و طعم‌ها</span> |
| `pages.contact.title` | Contact | İletişim | <span dir="rtl">تماس با ما</span> |
| `pages.contact.description` | Questions, projects, collabs: write to me. | Sorular, projeler, iş birlikleri: bana yazın. | <span dir="rtl">پرسش، پروژه یا همکاری: برایم بنویسید.</span> |
| `joint.ariaLabel` | Open {{title}} | {{title}} sayfasını aç | <span dir="rtl">باز کردن {{title}}</span> |
| `sound.mute` | Mute sound | Sesi kapat | <span dir="rtl">قطع صدا</span> |
| `sound.unmute` | Turn sound on | Sesi aç | <span dir="rtl">وصل صدا</span> |
| `sound.enable` | Tap to enable sound | Sesi açmak için dokun | <span dir="rtl">برای فعال کردن صدا ضربه بزنید</span> |
| `menu.navLabel` | Pages | Sayfalar | <span dir="rtl">صفحه‌ها</span> |
| `home.back` | Home | Ana sayfa | <span dir="rtl">خانه</span> |
| `home.backLabel` | Back to the home page | Ana sayfaya dön | <span dir="rtl">بازگشت به صفحهٔ اصلی</span> |
| `notFound.label` | Page not found | Sayfa bulunamadı | <span dir="rtl">صفحه پیدا نشد</span> |
| `notFound.text` | There's nothing at this address. | Bu adreste bir şey yok. | <span dir="rtl">در این نشانی چیزی وجود ندارد.</span> |
| `notFound.back` | Back to home | Ana sayfaya dön | <span dir="rtl">بازگشت به خانه</span> |
| `language.button` | Language: {{name}}. Change language | Dil: {{name}}. Dili değiştir | <span dir="rtl">زبان: {{name}}. تغییر زبان</span> |
| `language.list` | Languages | Diller | <span dir="rtl">زبان‌ها</span> |
| `ask.tooltip` | Ask a question | Bir soru sor | <span dir="rtl">یک سؤال بپرس</span> |
| `ask.open` | Ask the cat a question | Kediye bir soru sor | <span dir="rtl">از گربه یک سؤال بپرس</span> |
| `ask.title` | Ask the cat | Kediye sor | <span dir="rtl">از گربه بپرس</span> |
| `ask.close` | Close chat | Sohbeti kapat | <span dir="rtl">بستن گفت‌وگو</span> |
| `ask.newChat` | New chat | Yeni sohbet | <span dir="rtl">گفت‌وگوی تازه</span> |
| `ask.greeting` | Meow! I'm the cat of this site. Ask me anything about it. | Miyav! Bu sitenin kedisiyim. Site hakkında bana istediğini sorabilirsin. | <span dir="rtl">میو! من گربهٔ این سایتم. هر چه دربارهٔ سایت می‌خواهی از من بپرس.</span> |
| `ask.inputLabel` | Your question | Sorun | <span dir="rtl">سؤال تو</span> |
| `ask.placeholder` | Type your question… | Sorunu yaz… | <span dir="rtl">سؤالت را بنویس…</span> |
| `ask.send` | Send | Gönder | <span dir="rtl">بفرست</span> |
| `ask.typing` | The cat is typing… | Kedi yazıyor… | <span dir="rtl">گربه دارد می‌نویسد…</span> |
| `ask.counter` | {{n}} / {{max}} | {{n}} / {{max}} | <span dir="rtl">{{n}} / {{max}}</span> |
| `ask.retry` | Try again | Tekrar dene | <span dir="rtl">دوباره امتحان کن</span> |
| `ask.errors.not_configured` | The AI isn't set up yet. | Yapay zekâ henüz kurulmadı. | <span dir="rtl">هوش مصنوعی هنوز راه‌اندازی نشده است.</span> |
| `ask.errors.rate_limited` | Too many messages, try again in a minute. | Çok fazla mesaj gönderildi, bir dakika sonra tekrar dene. | <span dir="rtl">پیام‌ها زیاد شد؛ یک دقیقهٔ دیگر دوباره امتحان کن.</span> |
| `ask.errors.error` | Something went wrong. | Bir şeyler ters gitti. | <span dir="rtl">مشکلی پیش آمد.</span> |
| `shop.note` | Showcase only · 21+ | Yalnızca vitrin · 21+ | <span dir="rtl">فقط برای نمایش · ۲۱+</span> |
| `shop.gridLabel` | {{title}}: all products | {{title}}: tüm ürünler | <span dir="rtl">{{title}}: همهٔ محصولات</span> |
| `shop.add` | Add {{name}} to cart | {{name}} ürününü sepete ekle | <span dir="rtl">افزودن {{name}} به سبد خرید</span> |
| `shop.increase` | One more {{name}} | Bir {{name}} daha | <span dir="rtl">یک {{name}} دیگر</span> |
| `shop.decrease` | One less {{name}} | Bir {{name}} eksilt | <span dir="rtl">یک {{name}} کمتر</span> |
| `shop.quantity` | Quantity of {{name}} | {{name}} adedi | <span dir="rtl">تعداد {{name}}</span> |
| `shop.tags.new` | New | Yeni | <span dir="rtl">جدید</span> |
| `shop.tags.bestseller` | Best seller | Çok satan | <span dir="rtl">پرفروش</span> |
| `shop.tags.limited` | Limited | Sınırlı | <span dir="rtl">محدود</span> |
| `shop.cart.open` | Open cart, {{n}} items | Sepeti aç, {{n}} ürün | <span dir="rtl">باز کردن سبد خرید، {{n}} قلم</span> |
| `shop.cart.title` | Your cart | Sepetin | <span dir="rtl">سبد خرید تو</span> |
| `shop.cart.empty` | Your cart is empty. | Sepetin boş. | <span dir="rtl">سبد خریدت خالی است.</span> |
| `shop.cart.subtotal` | Subtotal | Ara toplam | <span dir="rtl">جمع جزء</span> |
| `shop.cart.checkout` | Checkout (coming soon) | Ödeme (yakında) | <span dir="rtl">پرداخت (به‌زودی)</span> |
| `shop.cart.clear` | Clear cart | Sepeti boşalt | <span dir="rtl">خالی کردن سبد</span> |
| `shop.cart.remove` | Remove {{name}} | {{name}} ürününü çıkar | <span dir="rtl">حذف {{name}}</span> |
| `shop.cart.close` | Close cart | Sepeti kapat | <span dir="rtl">بستن سبد خرید</span> |
| `shop.cart.discount` | 21+ discount ({{pct}}) | 21+ indirimi ({{pct}}) | <span dir="rtl">تخفیف ۲۱+ ({{pct}})</span> |
| `shop.cart.total` | Total | Toplam | <span dir="rtl">جمع کل</span> |
| `shop.cart.was` | Was {{price}} | Önceki fiyat {{price}} | <span dir="rtl">قیمت قبلی {{price}}</span> |
| `shop.top` | Back to top | Başa dön | <span dir="rtl">بازگشت به بالا</span> |
| `shop.heroAlt.joints` | A black cat with glowing green eyes among green leaves | Yeşil yapraklar arasında parlayan yeşil gözlü kara bir kedi | <span dir="rtl">گربه‌ای سیاه با چشمان سبز درخشان میان برگ‌های سبز</span> |
| `shop.heroAlt.vapes` | A tabby cat in a bucket hat on red velvet, with clouds and a sun | Kırmızı kadife üzerinde, bulutlar ve bir güneşle balıkçı şapkalı tekir kedi | <span dir="rtl">گربهٔ ببری با کلاه آفتابی روی مخمل قرمز، با ابرها و یک خورشید</span> |
| `shop.contact.title` | Send a message | Mesaj gönder | <span dir="rtl">پیام بفرستید</span> |
| `shop.contact.line` | Questions, orders, collabs. Drop me a line. | Sorular, siparişler, iş birlikleri. Bir satır bırak. | <span dir="rtl">سؤال، سفارش، همکاری؟ برایم بنویس.</span> |
| `shop.contact.name` | Name | Ad | <span dir="rtl">نام</span> |
| `shop.contact.email` | Email | E-posta | <span dir="rtl">ایمیل</span> |
| `shop.contact.message` | Message | Mesaj | <span dir="rtl">پیام</span> |
| `shop.contact.send` | Send | Gönder | <span dir="rtl">فرستادن</span> |
| `shop.contact.sending` | Sending… | Gönderiliyor… | <span dir="rtl">در حال فرستادن…</span> |
| `shop.contact.success` | Thanks! Your message is on its way. | Teşekkürler! Mesajın yola çıktı. | <span dir="rtl">ممنون! پیامت در راه است.</span> |
| `shop.contact.error` | Couldn't send. Try again or email me directly. | Gönderilemedi. Tekrar dene ya da bana doğrudan e-posta at. | <span dir="rtl">فرستاده نشد. دوباره امتحان کن یا مستقیم به من ایمیل بزن.</span> |
| `shop.contact.rateLimited` | That's a lot of messages. Try again in a few minutes, or email me directly. | Çok fazla mesaj oldu. Birkaç dakika sonra tekrar dene ya da bana doğrudan e-posta at. | <span dir="rtl">پیام‌ها زیاد شد. چند دقیقهٔ دیگر دوباره امتحان کن یا مستقیم به من ایمیل بزن.</span> |
| `shop.contact.direct` | or email me directly | ya da bana doğrudan e-posta at | <span dir="rtl">یا مستقیم به من ایمیل بزن</span> |
| `shop.contact.counter` | {{n}} / {{max}} | {{n}} / {{max}} | <span dir="rtl">{{n}} / {{max}}</span> |
| `shop.contact.invalid.name` | Please tell me your name. | Lütfen adını yaz. | <span dir="rtl">لطفاً نامت را بنویس.</span> |
| `shop.contact.invalid.email` | Please enter a valid email address. | Lütfen geçerli bir e-posta adresi gir. | <span dir="rtl">لطفاً یک نشانی ایمیل درست وارد کن.</span> |
| `shop.contact.invalid.message` | Please write a message. | Lütfen bir mesaj yaz. | <span dir="rtl">لطفاً یک پیام بنویس.</span> |
| `shop.items.emerald-night.name` | Emerald Night | Zümrüt Gece | <span dir="rtl">شب زمردی</span> |
| `shop.items.emerald-night.tagline` | Deep green calm with a midnight finish. | Gece yarısı dokunuşlu, derin yeşil bir sükûnet. | <span dir="rtl">آرامشی سبز و عمیق با پایانی نیمه‌شبی.</span> |
| `shop.items.black-forest.name` | Black Forest | Kara Orman | <span dir="rtl">جنگل سیاه</span> |
| `shop.items.black-forest.tagline` | Earthy and woody, like a walk at dusk. | Topraksı ve odunsu, akşamüstü bir yürüyüş gibi. | <span dir="rtl">خاکی و چوبی، مثل قدم‌زدن در غروب.</span> |
| `shop.items.velvet-leaf.name` | Velvet Leaf | Kadife Yaprak | <span dir="rtl">برگ مخملی</span> |
| `shop.items.velvet-leaf.tagline` | Soft as velvet, rolled with care. | Kadife kadar yumuşak, özenle sarılmış. | <span dir="rtl">نرم مثل مخمل، با دقت پیچیده‌شده.</span> |
| `shop.items.jade-smoke.name` | Jade Smoke | Yeşim Duman | <span dir="rtl">دود یشمی</span> |
| `shop.items.jade-smoke.tagline` | Cool, smooth and a little mysterious. | Serin, yumuşak ve biraz gizemli. | <span dir="rtl">خنک، نرم و کمی رازآلود.</span> |
| `shop.items.midnight-mint.name` | Midnight Mint | Gece Yarısı Nanesi | <span dir="rtl">نعناع نیمه‌شب</span> |
| `shop.items.midnight-mint.tagline` | A fresh mint breeze for late nights. | Geç saatler için taze bir nane esintisi. | <span dir="rtl">نسیم تازهٔ نعناع برای شب‌های دیروقت.</span> |
| `shop.items.green-comet.name` | Green Comet | Yeşil Kuyruklu Yıldız | <span dir="rtl">ستارهٔ سبز</span> |
| `shop.items.green-comet.tagline` | Bright, bold and gone in a flash. | Parlak, cesur ve göz açıp kapayıncaya kadar. | <span dir="rtl">درخشان، جسور و گذرا مثل یک برق.</span> |
| `shop.items.obsidian-haze.name` | Obsidian Haze | Obsidyen Pus | <span dir="rtl">مه ابسیدین</span> |
| `shop.items.obsidian-haze.tagline` | Dark, glossy and slow-burning. | Koyu, parlak ve ağır ağır yanan. | <span dir="rtl">تیره، براق و آرام‌سوز.</span> |
| `shop.items.moss-and-moon.name` | Moss & Moon | Yosun ve Ay | <span dir="rtl">خزه و ماه</span> |
| `shop.items.moss-and-moon.tagline` | Mossy greens under a silver moon. | Gümüş bir ayın altında yosun yeşilleri. | <span dir="rtl">سبزهای خزه‌ای زیر ماهی نقره‌ای.</span> |
| `shop.items.neon-sage.name` | Neon Sage | Neon Adaçayı | <span dir="rtl">مریم‌گلی نئونی</span> |
| `shop.items.neon-sage.tagline` | Herbal and bright, with a neon glow. | Bitkisel ve canlı, neon bir parıltıyla. | <span dir="rtl">گیاهی و روشن، با درخششی نئونی.</span> |
| `shop.items.silent-pine.name` | Silent Pine | Sessiz Çam | <span dir="rtl">کاج خاموش</span> |
| `shop.items.silent-pine.tagline` | Quiet pine notes for a slow evening. | Ağır akşamlar için sakin çam notaları. | <span dir="rtl">رایحه‌ای آرام از کاج برای عصری آهسته.</span> |
| `shop.items.cherry-pop.name` | Cherry Pop | Kiraz Pop | <span dir="rtl">گیلاس پاپ</span> |
| `shop.items.cherry-pop.tagline` | Sweet cherry with a fizzy little kick. | Gazoz gibi küçük bir dokunuşla tatlı kiraz. | <span dir="rtl">گیلاس شیرین با کمی هیجان گازدار.</span> |
| `shop.items.red-velvet.name` | Red Velvet | Kırmızı Kadife | <span dir="rtl">مخمل قرمز</span> |
| `shop.items.red-velvet.tagline` | Rich, creamy and smooth as cake. | Pasta gibi zengin, kremsi ve yumuşak. | <span dir="rtl">غنی، خامه‌ای و نرم مثل کیک.</span> |
| `shop.items.ruby-cloud.name` | Ruby Cloud | Yakut Bulut | <span dir="rtl">ابر یاقوتی</span> |
| `shop.items.ruby-cloud.tagline` | Big soft clouds with a berry glow. | Böğürtlen ışıltılı, iri ve yumuşak bulutlar. | <span dir="rtl">ابرهای بزرگ و نرم با درخششی تمشکی.</span> |
| `shop.items.scarlet-mist.name` | Scarlet Mist | Al Sis | <span dir="rtl">مه سرخ</span> |
| `shop.items.scarlet-mist.tagline` | Light red mist, bright and breezy. | Hafif kırmızı bir sis, ferah ve esintili. | <span dir="rtl">مهی سرخ و سبک، روشن و پرنسیم.</span> |
| `shop.items.cinnamon-kiss.name` | Cinnamon Kiss | Tarçın Öpücüğü | <span dir="rtl">بوسهٔ دارچین</span> |
| `shop.items.cinnamon-kiss.tagline` | Warm cinnamon with a sweet finish. | Tatlı bir bitişle sıcacık tarçın. | <span dir="rtl">دارچین گرم با پایانی شیرین.</span> |
| `shop.items.strawberry-haze.name` | Strawberry Haze | Çilek Pusu | <span dir="rtl">مه توت‌فرنگی</span> |
| `shop.items.strawberry-haze.tagline` | Juicy strawberry in a dreamy haze. | Rüya gibi bir pusun içinde sulu çilek. | <span dir="rtl">توت‌فرنگی آبدار در مهی رؤیایی.</span> |
| `shop.items.crimson-wave.name` | Crimson Wave | Kızıl Dalga | <span dir="rtl">موج ارغوانی</span> |
| `shop.items.crimson-wave.tagline` | Bold red berries rolling in like a wave. | Dalga gibi gelen cüretkâr kırmızı meyveler. | <span dir="rtl">توت‌های قرمز جسور که مثل موج می‌رسند.</span> |
| `shop.items.rose-quartz.name` | Rose Quartz | Pembe Kuvars | <span dir="rtl">رز کوارتز</span> |
| `shop.items.rose-quartz.tagline` | Delicate rose and lychee, pretty in pink. | Narin gül ve liçi, pembenin en zarifi. | <span dir="rtl">گل سرخ و لیچی ظریف، صورتی و دلبر.</span> |
| `shop.items.pomegranate-glow.name` | Pomegranate Glow | Nar Işıltısı | <span dir="rtl">درخشش انار</span> |
| `shop.items.pomegranate-glow.tagline` | Tart pomegranate that lights up the night. | Geceyi aydınlatan mayhoş nar. | <span dir="rtl">انار ملس که شب را روشن می‌کند.</span> |
| `shop.items.snow-and-ember.name` | Snow & Ember | Kar ve Kor | <span dir="rtl">برف و اخگر</span> |
| `shop.items.snow-and-ember.tagline` | Icy cool meets a warm red spark. | Buz gibi serinlik, sıcak kırmızı bir kıvılcımla buluşuyor. | <span dir="rtl">خنکای یخ، کنار جرقه‌ای گرم و سرخ.</span> |
| `shop.items.aurora-leaf.name` | Aurora Leaf | Aurora Yaprağı | <span dir="rtl">برگ شفق</span> |
| `shop.items.aurora-leaf.tagline` | Northern-lights green, soft and cool. | Kuzey ışıkları yeşili, yumuşak ve serin. | <span dir="rtl">سبزِ شفق قطبی، نرم و خنک.</span> |
| `shop.items.smoky-fern.name` | Smoky Fern | Dumanlı Eğrelti | <span dir="rtl">سرخس دودی</span> |
| `shop.items.smoky-fern.tagline` | Lush and leafy, with a smoky twist. | Gür ve yapraklı, dumanlı bir dokunuşla. | <span dir="rtl">سرسبز و پربرگ، با کمی حال‌وهوای دودی.</span> |
| `shop.items.berry-blaze.name` | Berry Blaze | Meyve Alevi | <span dir="rtl">شعلهٔ توت</span> |
| `shop.items.berry-blaze.tagline` | Mixed red berries with a bold, bright finish. | Cesur ve canlı bitişli karışık kırmızı meyveler. | <span dir="rtl">توت‌های قرمز مخلوط با پایانی جسور و روشن.</span> |
| `shop.items.velvet-sunset.name` | Velvet Sunset | Kadife Gün Batımı | <span dir="rtl">غروب مخملی</span> |
| `shop.items.velvet-sunset.tagline` | Warm sunset reds, smooth and mellow. | Sıcak gün batımı kırmızıları, yumuşak ve dingin. | <span dir="rtl">سرخی گرم غروب، نرم و ملایم.</span> |
| `shop.items.wild-clover.name` | Wild Clover | Yabani Yonca | <span dir="rtl">شبدر وحشی</span> |
| `shop.items.wild-clover.tagline` | Fresh meadow green with a soft herbal edge. | Hafif bitkisel dokunuşlu, taze çayır yeşili. | <span dir="rtl">سبزِ تازهٔ چمنزار با ته‌مایه‌ای گیاهی.</span> |
| `shop.items.pine-whisper.name` | Pine Whisper | Çam Fısıltısı | <span dir="rtl">زمزمهٔ کاج</span> |
| `shop.items.pine-whisper.tagline` | Cool pine needles and a quiet, woody finish. | Serin çam iğneleri ve sakin, odunsu bir bitiş. | <span dir="rtl">سوزن‌های خنک کاج و پایانی آرام و چوبی.</span> |
| `shop.items.lime-lantern.name` | Lime Lantern | Misket Feneri | <span dir="rtl">فانوس لیمو</span> |
| `shop.items.lime-lantern.tagline` | Bright, zesty lime that lights up slowly. | Yavaşça parlayan canlı, ferah misket limonu. | <span dir="rtl">لیموترش تند و روشنی که آرام‌آرام می‌درخشد.</span> |
| `shop.items.olive-dusk.name` | Olive Dusk | Zeytin Akşamı | <span dir="rtl">غروب زیتونی</span> |
| `shop.items.olive-dusk.tagline` | Mellow olive green for slow evenings. | Ağır akşamlar için yumuşak zeytin yeşili. | <span dir="rtl">سبز زیتونیِ ملایم برای عصرهای آرام.</span> |
| `shop.items.forest-ember.name` | Forest Ember | Orman Közü | <span dir="rtl">اخگر جنگل</span> |
| `shop.items.forest-ember.tagline` | Smoky forest floor with a warm glow. | Sıcak bir parıltıyla dumanlı orman toprağı. | <span dir="rtl">خاک دودی جنگل با درخششی گرم.</span> |
| `shop.items.basil-breeze.name` | Basil Breeze | Fesleğen Esintisi | <span dir="rtl">نسیم ریحان</span> |
| `shop.items.basil-breeze.tagline` | Light, peppery basil on a summer breeze. | Yaz esintisinde hafif, biberimsi fesleğen. | <span dir="rtl">ریحانِ سبک و تند در نسیم تابستان.</span> |
| `shop.items.cedar-mist.name` | Cedar Mist | Sedir Sisi | <span dir="rtl">مه سدر</span> |
| `shop.items.cedar-mist.tagline` | Soft cedar wood wrapped in a gentle haze. | Yumuşak bir pusa sarılmış sedir ağacı. | <span dir="rtl">چوب نرم سدر در مهی ملایم.</span> |
| `shop.items.kiwi-cloud.name` | Kiwi Cloud | Kivi Bulutu | <span dir="rtl">ابر کیوی</span> |
| `shop.items.kiwi-cloud.tagline` | Tangy green kiwi on a fluffy cloud. | Kabarık bir bulutta ekşimsi yeşil kivi. | <span dir="rtl">کیوی سبز و ترش روی ابری پف‌دار.</span> |
| `shop.items.raspberry-rain.name` | Raspberry Rain | Ahududu Yağmuru | <span dir="rtl">باران تمشک</span> |
| `shop.items.raspberry-rain.tagline` | Juicy raspberries in a cool summer shower. | Serin bir yaz sağanağında sulu ahududular. | <span dir="rtl">تمشک‌های آبدار در رگبار خنک تابستان.</span> |
| `shop.items.coral-crush.name` | Coral Crush | Mercan Şöleni | <span dir="rtl">شور مرجانی</span> |
| `shop.items.coral-crush.tagline` | Pink grapefruit and coral-bright citrus. | Pembe greyfurt ve mercan kadar canlı narenciye. | <span dir="rtl">گریپ‌فروت صورتی و مرکباتی به روشنی مرجان.</span> |
| `shop.items.blush-mirage.name` | Blush Mirage | Pembe Serap | <span dir="rtl">سراب صورتی</span> |
| `shop.items.blush-mirage.tagline` | Rose petals and lychee, light as air. | Gül yaprakları ve liçi, hava kadar hafif. | <span dir="rtl">گلبرگ رز و لیچی، سبک مثل هوا.</span> |
| `shop.items.cranberry-chill.name` | Cranberry Chill | Buzlu Kızılcık | <span dir="rtl">زغال‌اختهٔ یخی</span> |
| `shop.items.cranberry-chill.tagline` | Tart cranberry with an icy finish. | Buz gibi bir bitişle ekşi kızılcık. | <span dir="rtl">زغال‌اختهٔ ترش با پایانی یخی.</span> |
| `shop.items.sunset-soda.name` | Sunset Soda | Gün Batımı Gazozu | <span dir="rtl">نوشابهٔ غروب</span> |
| `shop.items.sunset-soda.tagline` | Orange and cherry soda at golden hour. | Altın saatte portakallı ve vişneli gazoz. | <span dir="rtl">نوشابهٔ پرتقال و آلبالو در ساعت طلایی.</span> |
| `shop.items.pink-lemon.name` | Pink Lemon | Pembe Limon | <span dir="rtl">لیموی صورتی</span> |
| `shop.items.pink-lemon.tagline` | Sparkling pink lemonade, sweet and sharp. | Köpüklü pembe limonata, tatlı ve keskin. | <span dir="rtl">لیموناد صورتی گازدار، شیرین و تند.</span> |
| `shop.items.lava-berry.name` | Lava Berry | Lav Meyvesi | <span dir="rtl">توت گدازه</span> |
| `shop.items.lava-berry.tagline` | Hot red berries with a spicy little kick. | Küçük, baharatlı bir dokunuşla sıcak kırmızı meyveler. | <span dir="rtl">توت‌های سرخ و داغ با کمی تندی.</span> |
| `shop.items.peach-cloud.name` | Peach Cloud | Şeftali Bulutu | <span dir="rtl">ابر هلو</span> |
| `shop.items.peach-cloud.tagline` | Ripe peach, smooth and soft as a cloud. | Olgun şeftali, bulut kadar yumuşak. | <span dir="rtl">هلوی رسیده، نرم و لطیف مثل ابر.</span> |
| `shop.shelf.prev` | Show previous products | Önceki ürünleri göster | <span dir="rtl">نمایش محصولات قبلی</span> |
| `shop.shelf.next` | Show more products | Daha fazla ürün göster | <span dir="rtl">نمایش محصولات بیشتر</span> |
| `shop.shelf.count` | {{n}} products | {{n}} ürün | <span dir="rtl">{{n}} محصول</span> |
| `gate.label` | Age check | Yaş kontrolü | <span dir="rtl">بررسی سن</span> |
| `gate.title` | Scratch to reveal your gift | Hediyeni görmek için kazı | <span dir="rtl">برای دیدن هدیه‌ات بخراش</span> |
| `gate.scratchHere` | Scratch me | Silin lütfen | <span dir="rtl">لطفاً پاک کنید</span> |
| `gate.reveal` | Can't scratch? Reveal it | Kazıyamıyor musun? Göster | <span dir="rtl">نمی‌توانی بخراشی؟ نشانم بده</span> |
| `gate.won` | You won {{pct}} off! | {{pct}} indirim kazandın! | <span dir="rtl">{{pct}} تخفیف بردی!</span> |
| `gate.wonNote` | It's applied to everything in your cart. | Sepetindeki her şeye uygulanır. | <span dir="rtl">روی همهٔ محصولات سبد خریدت اعمال می‌شود.</span> |
| `gate.ask` | Are you 21 or older? | 21 yaşında veya daha büyük müsün? | <span dir="rtl">آیا ۲۱ سال یا بیشتر داری؟</span> |
| `gate.yes` | Yes, I'm 21+ | Evet, 21+ yaşındayım | <span dir="rtl">بله، ۲۱+ هستم</span> |
| `gate.no` | No | Hayır | <span dir="rtl">نه</span> |
| `gate.deniedTitle` | Sorry! | Üzgünüz! | <span dir="rtl">متأسفیم!</span> |
| `gate.denied` | This site is only for adults 21 and over. | Bu site yalnızca 21 yaş ve üzeri yetişkinler içindir. | <span dir="rtl">این سایت فقط برای بزرگسالان ۲۱ سال به بالاست.</span> |
| `gate.back` | I clicked by mistake | Yanlışlıkla bastım | <span dir="rtl">اشتباهی زدم</span> |
| `common.newTab` | (opens in a new tab) | (yeni sekmede açılır) | <span dir="rtl">(در زبانهٔ جدید باز می‌شود)</span> |
| `footer.tagline` | A small showcase shop with a cat-approved taste. | Kedi onaylı zevke sahip küçük bir vitrin dükkânı. | <span dir="rtl">یک فروشگاه ویترینی کوچک با سلیقه‌ای که گربه تأییدش کرده.</span> |
| `footer.pages` | Pages | Sayfalar | <span dir="rtl">صفحه‌ها</span> |
| `footer.contact` | Get in touch | İletişim | <span dir="rtl">در تماس باشیم</span> |
| `footer.home` | Home | Ana sayfa | <span dir="rtl">خانه</span> |
| `footer.location` | Eskişehir, Turkey | Eskişehir, Türkiye | <span dir="rtl">اسکی‌شهیر، ترکیه</span> |
| `footer.rights` | © {{year}} Mohammad Baharlou | © {{year}} Mohammad Baharlou | <span dir="rtl">© {{year}} Mohammad Baharlou</span> |
| `footer.made` | Made in Eskişehir with React and a little smoke. | Eskişehir'de React ve biraz dumanla yapıldı. | <span dir="rtl">ساخته‌شده در اسکی‌شهیر با React و کمی دود.</span> |
| `me.eyebrow` | About me | Hakkımda | <span dir="rtl">دربارهٔ من</span> |
| `me.intro` | I build elegant interfaces with clean structure, thoughtful motion and a strong focus on modern user experience. My focus is front-end and UI with React. | Temiz yapıya, özenli harekete ve modern kullanıcı deneyimine odaklanan zarif arayüzler geliştiriyorum. Odağım React ile frontend ve arayüz. | <span dir="rtl">رابط‌هایی زیبا با ساختاری تمیز، حرکتی سنجیده و تمرکز جدی بر تجربهٔ کاربری مدرن می‌سازم. تمرکزم فرانت‌اند و رابط کاربری با React است.</span> |
| `me.ctaContact` | Get in touch | İletişime geç | <span dir="rtl">تماس با من</span> |
| `me.ctaGithub` | See my GitHub | GitHub'ıma göz at | <span dir="rtl">گیت‌هاب من</span> |
| `me.card.title` | Profile | Profil | <span dir="rtl">پروفایل</span> |
| `me.card.based` | Based in | Konum | <span dir="rtl">محل زندگی</span> |
| `me.card.born` | Born | Doğum | <span dir="rtl">تولد</span> |
| `me.card.works` | Works at | Çalıştığım yer | <span dir="rtl">محل کار</span> |
| `me.card.worksTeam` | Design & Development team | Tasarım ve Geliştirme ekibi | <span dir="rtl">تیم طراحی و توسعه</span> |
| `me.card.studies` | Studies | Eğitim | <span dir="rtl">تحصیل</span> |
| `me.card.studiesValue` | Anadolu University | Anadolu Üniversitesi | <span dir="rtl">دانشگاه آنادولو</span> |
| `me.card.studiesField` | Public Relations & Advertising | Halkla İlişkiler ve Reklamcılık | <span dir="rtl">روابط عمومی و تبلیغات</span> |
| `me.card.speaks` | Speaks | Konuştuğum diller | <span dir="rtl">زبان‌ها</span> |
| `me.card.localTime` | Local time in Eskişehir | Eskişehir'de saat | <span dir="rtl">ساعت محلی اسکی‌شهیر</span> |
| `me.stats.years` | years of programming | yıllık programlama | <span dir="rtl">سال برنامه‌نویسی</span> |
| `me.stats.languages` | languages spoken | konuştuğum dil | <span dir="rtl">زبانی که صحبت می‌کنم</span> |
| `me.stats.repos` | public projects on GitHub | GitHub'da açık proje | <span dir="rtl">پروژهٔ عمومی در گیت‌هاب</span> |
| `me.stats.strongest` | strongest skill | en güçlü becerim | <span dir="rtl">قوی‌ترین مهارت</span> |
| `me.story.title` | My story | Hikâyem | <span dir="rtl">داستان من</span> |
| `me.story.who.title` | Who I am | Ben kimim | <span dir="rtl">من کی هستم</span> |
| `me.story.who.text` | I'm Mohammad Baharlou, a developer who enjoys creating sleek digital experiences that feel refined, intuitive and modern. | Ben Mohammad Baharlou; şık, rafine, sezgisel ve modern hissettiren dijital deneyimler yaratmayı seven bir geliştiriciyim. | <span dir="rtl">من محمد بهارلو هستم؛ توسعه‌دهنده‌ای که از ساختن تجربه‌های دیجیتالِ شیک، دقیق، شهودی و مدرن لذت می‌برد.</span> |
| `me.story.journey.title` | My journey | Yolculuğum | <span dir="rtl">مسیر من</span> |
| `me.story.journey.text` | For the last 5 years I've been sharpening my programming skills, with a strong interest in front-end technologies, design systems and interaction details. | Son 5 yıldır frontend teknolojilerine, tasarım sistemlerine ve etkileşim detaylarına büyük bir ilgiyle programlama becerilerimi geliştiriyorum. | <span dir="rtl">در ۵ سال گذشته مهارت‌های برنامه‌نویسی‌ام را با علاقهٔ زیاد به فناوری‌های فرانت‌اند، سیستم‌های طراحی و جزئیات تعامل پرورش داده‌ام.</span> |
| `me.story.education.title` | Education | Eğitim | <span dir="rtl">تحصیلات</span> |
| `me.story.education.text` | I study Public Relations and Advertising at Anadolu University in Eskişehir, which gives me a different perspective on communication and presentation. | Eskişehir'deki Anadolu Üniversitesi'nde Halkla İlişkiler ve Reklamcılık okuyorum; bu da bana iletişime ve sunuma farklı bir bakış açısı kazandırıyor. | <span dir="rtl">در دانشگاه آنادولو در اسکی‌شهیر روابط عمومی و تبلیغات می‌خوانم؛ رشته‌ای که نگاهی متفاوت به ارتباط و ارائه به من می‌دهد.</span> |
| `me.story.work.title` | Work | İş | <span dir="rtl">کار</span> |
| `me.story.work.text` | I work in the Design & Development team at Coalition Technologies. | Coalition Technologies'de Tasarım ve Geliştirme ekibinde çalışıyorum. | <span dir="rtl">در تیم طراحی و توسعهٔ Coalition Technologies کار می‌کنم.</span> |
| `me.story.home.title` | Where I live | Yaşadığım yer | <span dir="rtl">جایی که زندگی می‌کنم</span> |
| `me.story.home.text` | I live in Eskişehir, Turkey, where I keep studying and growing as a developer and creative thinker. | Eskişehir'de yaşıyorum; burada okumaya ve bir geliştirici ve yaratıcı biri olarak büyümeye devam ediyorum. | <span dir="rtl">در اسکی‌شهیر ترکیه زندگی می‌کنم و همان‌جا به تحصیل و رشد به‌عنوان توسعه‌دهنده و فردی خلاق ادامه می‌دهم.</span> |
| `me.story.languages.title` | Languages | Diller | <span dir="rtl">زبان‌ها</span> |
| `me.story.languages.text` | I speak English, Turkish and Persian, which helps me connect with different audiences and communities. | İngilizce, Türkçe ve Farsça konuşuyorum; bu da farklı kitlelerle ve topluluklarla bağ kurmama yardımcı oluyor. | <span dir="rtl">به انگلیسی، ترکی و فارسی صحبت می‌کنم و این کمک می‌کند با مخاطبان و جامعه‌های مختلف ارتباط بگیرم.</span> |
| `me.skills.title` | What I work with | Neler kullanıyorum | <span dir="rtl">با چه کار می‌کنم</span> |
| `me.skills.line` | The tools and skills I use to turn ideas into interfaces. | Fikirleri arayüze dönüştürmek için kullandığım araçlar ve beceriler. | <span dir="rtl">ابزارها و مهارت‌هایی که با آن‌ها ایده‌ها را به رابط کاربری تبدیل می‌کنم.</span> |
| `me.skills.strongest` | Strongest | En güçlü | <span dir="rtl">قوی‌ترین</span> |
| `me.skills.groups.frontend` | Frontend development | Frontend geliştirme | <span dir="rtl">توسعهٔ فرانت‌اند</span> |
| `me.skills.groups.design` | Design | Tasarım | <span dir="rtl">طراحی</span> |
| `me.skills.groups.tools` | Tools | Araçlar | <span dir="rtl">ابزارها</span> |
| `me.skills.groups.mobile` | Mobile development | Mobil geliştirme | <span dir="rtl">توسعهٔ موبایل</span> |
| `me.skills.groups.animation` | Animation | Animasyon | <span dir="rtl">انیمیشن</span> |
| `me.skills.names.uiDesign` | UI design | Arayüz tasarımı | <span dir="rtl">طراحی رابط کاربری</span> |
| `me.skills.names.layouts` | Modern layout systems | Modern yerleşim sistemleri | <span dir="rtl">سیستم‌های چیدمان مدرن</span> |
| `me.skills.names.components` | Component architecture | Bileşen mimarisi | <span dir="rtl">معماری کامپوننت</span> |
| `me.skills.names.responsive` | Responsive systems | Duyarlı sistemler | <span dir="rtl">سیستم‌های واکنش‌گرا</span> |
| `me.skills.names.native` | Native | Native | <span dir="rtl">نیتیو</span> |
| `me.work.title` | Selected work | Seçilmiş işler | <span dir="rtl">کارهای منتخب</span> |
| `me.work.line` | A few things I've built, all on GitHub. | Geliştirdiğim birkaç şey, hepsi GitHub'da. | <span dir="rtl">چند کاری که ساخته‌ام؛ همه در گیت‌هاب.</span> |
| `me.work.view` | View on GitHub | GitHub'da gör | <span dir="rtl">دیدن در گیت‌هاب</span> |
| `me.work.items.vibe1-future` | This website: React, TypeScript, Tailwind CSS and Framer Motion, in three languages. | Bu web sitesi: React, TypeScript, Tailwind CSS ve Framer Motion ile, üç dilde. | <span dir="rtl">همین وب‌سایت: با React، TypeScript، Tailwind CSS و Framer Motion، به سه زبان.</span> |
| `me.work.items.my-portfolio` | My earlier portfolio site, with a tic-tac-toe page for when you're bored. | Sıkıldığınızda oynamak için bir XOX sayfası da olan önceki portfolyo sitem. | <span dir="rtl">سایت نمونه‌کار قبلی‌ام، با یک صفحهٔ دوز برای وقت‌هایی که حوصله‌تان سر رفته.</span> |
| `me.work.items.my-weather-calc-app` | A weather and calculator app built with Next.js and TypeScript. | Next.js ve TypeScript ile yapılmış bir hava durumu ve hesap makinesi uygulaması. | <span dir="rtl">اپلیکیشن آب‌وهوا و ماشین‌حساب، ساخته‌شده با Next.js و TypeScript.</span> |
| `me.work.items.shop-react-web` | A shop front-end built with React. | React ile yapılmış bir mağaza arayüzü. | <span dir="rtl">رابط یک فروشگاه که با React ساخته شده.</span> |
| `me.work.items.bhCrypto-web` | A website about crypto. | Kripto hakkında bir web sitesi. | <span dir="rtl">وب‌سایتی دربارهٔ رمزارز.</span> |
| `me.work.items.crypto-app` | A crypto app written in JavaScript. | JavaScript ile yazılmış bir kripto uygulaması. | <span dir="rtl">اپلیکیشن رمزارز با JavaScript.</span> |
| `me.cta.title` | Have an idea? | Bir fikrin mi var? | <span dir="rtl">ایده‌ای داری؟</span> |
| `me.cta.line` | Let's turn it into something people enjoy using. | Onu insanların kullanmaktan keyif aldığı bir şeye dönüştürelim. | <span dir="rtl">بیا آن را به چیزی تبدیل کنیم که مردم از استفاده‌اش لذت ببرند.</span> |
| `me.cta.button` | Let's talk | Konuşalım | <span dir="rtl">بیا صحبت کنیم</span> |
| `contactPage.eyebrow` | Contact | İletişim | <span dir="rtl">تماس</span> |
| `contactPage.headline` | Let's talk | Konuşalım | <span dir="rtl">بیا صحبت کنیم</span> |
| `contactPage.line` | Questions, projects or a collab idea: pick whatever's easiest for you. I read every message. | Sorular, projeler ya da bir iş birliği fikri: size en kolay geleni seçin. Her mesajı okurum. | <span dir="rtl">پرسش، پروژه یا ایدهٔ همکاری: هر راهی که برایتان راحت‌تر است. همهٔ پیام‌ها را می‌خوانم.</span> |
| `contactPage.email` | Email | E-posta | <span dir="rtl">ایمیل</span> |
| `contactPage.copy` | Copy | Kopyala | <span dir="rtl">کپی</span> |
| `contactPage.copied` | Copied! | Kopyalandı! | <span dir="rtl">کپی شد!</span> |
| `contactPage.copyLabel` | Copy email address | E-posta adresini kopyala | <span dir="rtl">کپی نشانی ایمیل</span> |
| `contactPage.phone` | Phone | Telefon | <span dir="rtl">تلفن</span> |
| `contactPage.call` | Call | Ara | <span dir="rtl">تماس</span> |
| `contactPage.github` | GitHub | GitHub | <span dir="rtl">گیت‌هاب</span> |
| `contactPage.githubAction` | Open profile | Profili aç | <span dir="rtl">باز کردن پروفایل</span> |
| `contactPage.location` | Location | Konum | <span dir="rtl">مکان</span> |
| `contactPage.localTime` | It's {{time}} here right now | Burada saat şu an {{time}} | <span dir="rtl">اینجا الان ساعت {{time}} است</span> |
| `contactPage.languages` | You can write to me in English, Türkçe or فارسی. | Bana English, Türkçe ya da فارسی yazabilirsiniz. | <span dir="rtl">می‌توانید به English، Türkçe یا فارسی برایم بنویسید.</span> |
