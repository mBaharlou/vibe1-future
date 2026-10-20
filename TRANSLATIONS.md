# Translations

Every user-visible string, in all three languages, for native-speaker review. Source files:
`src/locales/en.json`, `tr.json`, `fa.json` (same keys; a missing key is a TypeScript error).
The JSON files are what the site uses; update this table when you change them.

Not translated on purpose: the **CLAUDE** wordmark, and the language names in the switcher,
which always show in their own language (English, Türkçe, فارسی).

## Please review

- `topBar.label` (tr): "Grafik tasarım promptları" drops the "for". Turkish puts "için" after
  the noun ("Claude için"), and CLAUDE sits on the line below, so a literal "… için" would read
  wrongly. "İstem" is the formal TDK word for "prompt"; "prompt" is what designers actually say.
- `meta.homeTitle` (tr, fa): the tab title "my vibe coding ai" is informal English slang;
  the translations keep "vibe coding" as a loanword.
- `page.body1–3` (fa): standard Persian lorem ipsum filler (لورم ایپسوم), not a translation.
  Turkish keeps the Latin lorem ipsum, which is the norm there.
- `shard.hintDwelling` (tr, fa): "Hold to open" means *keep the pointer on the shard*,
  not press and hold. Check the wording reads that way.

## All keys

| Key | English | Türkçe | فارسی |
| --- | --- | --- | --- |
| `meta.homeTitle` | my vibe coding ai | vibe coding yapay zekâm | <span dir="rtl">هوش مصنوعیِ وایب‌کدینگ من</span> |
| `meta.pageTitle` | {{title}} · Claude | {{title}} · Claude | <span dir="rtl">{{title}} · Claude</span> |
| `meta.notFoundTitle` | Not found | Sayfa bulunamadı | <span dir="rtl">صفحه پیدا نشد</span> |
| `topBar.label` | Graphic design prompts for | Grafik tasarım promptları | <span dir="rtl">پرامپت‌های طراحی گرافیک برای</span> |
| `hero.subtitle` | Instantly level up your work using Claude.ai! | Claude.ai ile işini hemen bir üst seviyeye taşı! | <span dir="rtl">با Claude.ai کارتان را همین حالا یک پله بالاتر ببرید!</span> |
| `hero.catAlt` | Tabby cat in a sunny field | Güneşli bir çayırda tekir kedi | <span dir="rtl">گربهٔ ببری در یک چمنزار آفتابی</span> |
| `pages.p1.title` | Page 1 | Sayfa 1 | <span dir="rtl">صفحهٔ ۱</span> |
| `pages.p1.description` | Placeholder: a short line about what lives on page one. | Yer tutucu: birinci sayfada neler olduğunu anlatan kısa bir cümle. | <span dir="rtl">متن موقت: یک جملهٔ کوتاه دربارهٔ محتوای صفحهٔ اول.</span> |
| `pages.p2.title` | Page 2 | Sayfa 2 | <span dir="rtl">صفحهٔ ۲</span> |
| `pages.p2.description` | Placeholder: a short line about what lives on page two. | Yer tutucu: ikinci sayfada neler olduğunu anlatan kısa bir cümle. | <span dir="rtl">متن موقت: یک جملهٔ کوتاه دربارهٔ محتوای صفحهٔ دوم.</span> |
| `pages.p3.title` | Page 3 | Sayfa 3 | <span dir="rtl">صفحهٔ ۳</span> |
| `pages.p3.description` | Placeholder: a short line about what lives on page three. | Yer tutucu: üçüncü sayfada neler olduğunu anlatan kısa bir cümle. | <span dir="rtl">متن موقت: یک جملهٔ کوتاه دربارهٔ محتوای صفحهٔ سوم.</span> |
| `pages.p4.title` | Page 4 | Sayfa 4 | <span dir="rtl">صفحهٔ ۴</span> |
| `pages.p4.description` | Placeholder: a short line about what lives on page four. | Yer tutucu: dördüncü sayfada neler olduğunu anlatan kısa bir cümle. | <span dir="rtl">متن موقت: یک جملهٔ کوتاه دربارهٔ محتوای صفحهٔ چهارم.</span> |
| `page.heading` | Page {{n}} | Sayfa {{n}} | <span dir="rtl">صفحهٔ {{n}}</span> |
| `page.body1` | Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. | Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. | <span dir="rtl">لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.</span> |
| `page.body2` | Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra. | Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra. | <span dir="rtl">کتاب‌های زیادی در شصت و سه درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می‌طلبد تا با نرم‌افزارها شناخت بیشتری را برای طراحان رایانه‌ای علی‌الخصوص طراحان خلاقی فراهم کند.</span> |
| `page.body3` | Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. | Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. | <span dir="rtl">در این صورت می‌توان امید داشت که تمام و دشواری موجود در ارائهٔ راهکارها و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی مورد استفاده قرار گیرد.</span> |
| `shard.ariaLabel` | Open {{title}} in a new tab | {{title}} yeni sekmede aç | <span dir="rtl">باز کردن {{title}} در زبانهٔ جدید</span> |
| `shard.hintDwelling` | Hold to open · click to go | Açmak için bekle · hemen gitmek için tıkla | <span dir="rtl">برای باز شدن نگه دارید · یا کلیک کنید</span> |
| `shard.hintOpened` | Opened in a new tab | Yeni sekmede açıldı | <span dir="rtl">در زبانهٔ جدید باز شد</span> |
| `shard.hintBlocked` | Click to open | Açmak için tıkla | <span dir="rtl">برای باز کردن کلیک کنید</span> |
| `shard.hintKeyboard` | Press Enter to open in a new tab | Yeni sekmede açmak için Enter'a bas | <span dir="rtl">برای باز کردن در زبانهٔ جدید Enter را بزنید</span> |
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
