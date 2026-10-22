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
- `page.body1–3` (fa): standard Persian lorem ipsum filler (لورم ایپسوم), not a translation.
  Turkish keeps the Latin lorem ipsum, which is the norm there.

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
| `pages.me.description` | Placeholder: a short line about me. | Yer tutucu: benimle ilgili kısa bir cümle. | <span dir="rtl">متن موقت: یک جملهٔ کوتاه دربارهٔ من.</span> |
| `pages.products.title` | Products | Ürünler | <span dir="rtl">محصولات</span> |
| `pages.products.description` | Joints & cigarettes | Joint'ler ve sigaralar | <span dir="rtl">جوینت و سیگار</span> |
| `pages.vapes.title` | Vapes | Vape'ler | <span dir="rtl">ویپ‌ها</span> |
| `pages.vapes.description` | Devices & flavors | Cihazlar ve aromalar | <span dir="rtl">دستگاه‌ها و طعم‌ها</span> |
| `pages.contact.title` | Contact | İletişim | <span dir="rtl">تماس با ما</span> |
| `pages.contact.description` | Placeholder: how to get in touch. | Yer tutucu: bana nasıl ulaşabileceğin. | <span dir="rtl">متن موقت: راه‌های ارتباط با ما.</span> |
| `page.body1` | Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. | Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. | <span dir="rtl">لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.</span> |
| `page.body2` | Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra. | Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra. | <span dir="rtl">کتاب‌های زیادی در شصت و سه درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می‌طلبد تا با نرم‌افزارها شناخت بیشتری را برای طراحان رایانه‌ای علی‌الخصوص طراحان خلاقی فراهم کند.</span> |
| `page.body3` | Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. | Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. | <span dir="rtl">در این صورت می‌توان امید داشت که تمام و دشواری موجود در ارائهٔ راهکارها و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی مورد استفاده قرار گیرد.</span> |
| `joint.ariaLabel` | Open {{title}} | {{title}} sayfasını aç | <span dir="rtl">باز کردن {{title}}</span> |
| `sound.mute` | Mute sound | Sesi kapat | <span dir="rtl">قطع صدا</span> |
| `sound.unmute` | Turn sound on | Sesi aç | <span dir="rtl">وصل صدا</span> |
| `sound.enable` | Tap to enable sound | Sesi açmak için dokun | <span dir="rtl">برای فعال کردن صدا ضربه بزنید</span> |
| `menu.open` | Open menu | Menüyü aç | <span dir="rtl">باز کردن منو</span> |
| `menu.close` | Close menu | Menüyü kapat | <span dir="rtl">بستن منو</span> |
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
| `shop.note` | Showcase only · 18+ | Yalnızca vitrin · 18+ | <span dir="rtl">فقط برای نمایش · ۱۸+</span> |
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
| `shop.cart.each` | {{price}} each | Tanesi {{price}} | <span dir="rtl">هر عدد {{price}}</span> |
| `shop.top` | Back to top | Başa dön | <span dir="rtl">بازگشت به بالا</span> |
| `shop.heroAlt.joints` | A black cat with glowing green eyes among green leaves | Yeşil yapraklar arasında parlayan yeşil gözlü kara bir kedi | <span dir="rtl">گربه‌ای سیاه با چشمان سبز درخشان میان برگ‌های سبز</span> |
| `shop.heroAlt.vapes` | A tabby cat in a bucket hat on red velvet, with clouds and a sun | Kırmızı kadife üzerinde, bulutlar ve bir güneşle balıkçı şapkalı tekir kedi | <span dir="rtl">گربهٔ ببری با کلاه آفتابی روی مخمل قرمز، با ابرها و یک خورشید</span> |
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
| `shop.contact.title` | Email me | Bana yaz | <span dir="rtl">به من ایمیل بزن</span> |
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
| `shop.items.aurora-leaf.name` | Aurora Leaf | Aurora Yaprağı | <span dir="rtl">برگ شفق</span> |
| `shop.items.aurora-leaf.tagline` | Northern-lights green, soft and cool. | Kuzey ışıkları yeşili, yumuşak ve serin. | <span dir="rtl">سبزِ شفق قطبی، نرم و خنک.</span> |
| `shop.items.smoky-fern.name` | Smoky Fern | Dumanlı Eğrelti | <span dir="rtl">سرخس دودی</span> |
| `shop.items.smoky-fern.tagline` | Lush and leafy, with a smoky twist. | Gür ve yapraklı, dumanlı bir dokunuşla. | <span dir="rtl">سرسبز و پربرگ، با کمی حال‌وهوای دودی.</span> |
| `shop.items.berry-blaze.name` | Berry Blaze | Meyve Alevi | <span dir="rtl">شعلهٔ توت</span> |
| `shop.items.berry-blaze.tagline` | Mixed red berries with a bold, bright finish. | Cesur ve canlı bitişli karışık kırmızı meyveler. | <span dir="rtl">توت‌های قرمز مخلوط با پایانی جسور و روشن.</span> |
| `shop.items.velvet-sunset.name` | Velvet Sunset | Kadife Gün Batımı | <span dir="rtl">غروب مخملی</span> |
| `shop.items.velvet-sunset.tagline` | Warm sunset reds, smooth and mellow. | Sıcak gün batımı kırmızıları, yumuşak ve dingin. | <span dir="rtl">سرخی گرم غروب، نرم و ملایم.</span> |
