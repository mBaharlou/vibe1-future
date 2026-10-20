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
| `pages.vapes.description` | Placeholder: a short line about the vapes. | Yer tutucu: vape'ler hakkında kısa bir cümle. | <span dir="rtl">متن موقت: یک جملهٔ کوتاه دربارهٔ ویپ‌ها.</span> |
| `pages.contact.title` | Contact | İletişim | <span dir="rtl">تماس با ما</span> |
| `pages.contact.description` | Placeholder: how to get in touch. | Yer tutucu: bana nasıl ulaşabileceğin. | <span dir="rtl">متن موقت: راه‌های ارتباط با ما.</span> |
| `page.body1` | Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. | Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. | <span dir="rtl">لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.</span> |
| `page.body2` | Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra. | Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra. | <span dir="rtl">کتاب‌های زیادی در شصت و سه درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می‌طلبد تا با نرم‌افزارها شناخت بیشتری را برای طراحان رایانه‌ای علی‌الخصوص طراحان خلاقی فراهم کند.</span> |
| `page.body3` | Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. | Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. | <span dir="rtl">در این صورت می‌توان امید داشت که تمام و دشواری موجود در ارائهٔ راهکارها و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی مورد استفاده قرار گیرد.</span> |
| `joint.ariaLabel` | Open {{title}} | {{title}} sayfasını aç | <span dir="rtl">باز کردن {{title}}</span> |
| `joint.hintBlocked` | Click to open | Açmak için tıkla | <span dir="rtl">برای باز کردن کلیک کنید</span> |
| `sound.mute` | Mute sound | Sesi kapat | <span dir="rtl">قطع صدا</span> |
| `sound.unmute` | Turn sound on | Sesi aç | <span dir="rtl">وصل صدا</span> |
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
