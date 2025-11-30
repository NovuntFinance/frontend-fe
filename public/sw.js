if (!self.define) {
  let e,
    a = {};
  const s = (s, c) => (
    (s = new URL(s + '.js', c).href),
    a[s] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const n =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[n]) return;
    let t = {};
    const d = (e) => s(e, n),
      r = { module: { uri: n }, exports: t, require: d };
    a[n] = Promise.all(c.map((e) => r[e] || d(e))).then((e) => (i(...e), t));
  };
}
define(['./workbox-cb477421'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/Novunt_BGI2.jpg',
          revision: '3a5bcec7a598b1773eb66861532b41ab',
        },
        {
          url: '/Novunt_BGI3.jpg',
          revision: 'e9130e77190b9ebe1685941b5222a776',
        },
        {
          url: '/Novunt_BGI4.jpg',
          revision: 'ff16e1f66345162bb75fabcbf3cd38e4',
        },
        {
          url: '/Novunt_BGI5.jpg',
          revision: 'ef29cae3f61236d8b09130b720bf4660',
        },
        {
          url: '/Novunt_BGI6.jpg',
          revision: 'fcf9e814c008149cb8eca6e9df3439d4',
        },
        {
          url: '/Novunt_BGI7.jpg',
          revision: 'f0732eb53b29c743838aed7cf76ed246',
        },
        {
          url: '/Novunt_BGI8.jpg',
          revision: '5d401476f1bfbe49a516288951c68cf7',
        },
        {
          url: '/_next/static/chunks/1198-764dec30ce85526c.js',
          revision: '764dec30ce85526c',
        },
        {
          url: '/_next/static/chunks/1423-90c9f9d2bbdf5b55.js',
          revision: '90c9f9d2bbdf5b55',
        },
        {
          url: '/_next/static/chunks/1528-90163d0fa36ddffe.js',
          revision: '90163d0fa36ddffe',
        },
        {
          url: '/_next/static/chunks/1646.f9222787e8cf193b.js',
          revision: 'f9222787e8cf193b',
        },
        {
          url: '/_next/static/chunks/1761-2b55da2da3a64060.js',
          revision: '2b55da2da3a64060',
        },
        {
          url: '/_next/static/chunks/1903-ddb003be238f09bc.js',
          revision: 'ddb003be238f09bc',
        },
        {
          url: '/_next/static/chunks/220-8fab1a9101e92b25.js',
          revision: '8fab1a9101e92b25',
        },
        {
          url: '/_next/static/chunks/2255-ff6de4616092d77c.js',
          revision: 'ff6de4616092d77c',
        },
        {
          url: '/_next/static/chunks/2619-7685271fdec8e6c8.js',
          revision: '7685271fdec8e6c8',
        },
        {
          url: '/_next/static/chunks/2894-28e866d3b6221f55.js',
          revision: '28e866d3b6221f55',
        },
        {
          url: '/_next/static/chunks/2985.5e722eb0a381bb78.js',
          revision: '5e722eb0a381bb78',
        },
        {
          url: '/_next/static/chunks/30a37ab2-a06207e12800ad53.js',
          revision: 'a06207e12800ad53',
        },
        {
          url: '/_next/static/chunks/3143-5f917473b0b2d7d5.js',
          revision: '5f917473b0b2d7d5',
        },
        {
          url: '/_next/static/chunks/3344-593a01ab13dee887.js',
          revision: '593a01ab13dee887',
        },
        {
          url: '/_next/static/chunks/3361.e1a4e5dc9e5a0111.js',
          revision: 'e1a4e5dc9e5a0111',
        },
        {
          url: '/_next/static/chunks/4038-6e873d41c44ba364.js',
          revision: '6e873d41c44ba364',
        },
        {
          url: '/_next/static/chunks/422-b4bf089bb7d94242.js',
          revision: 'b4bf089bb7d94242',
        },
        {
          url: '/_next/static/chunks/4337-fdc932ea8ae27a5d.js',
          revision: 'fdc932ea8ae27a5d',
        },
        {
          url: '/_next/static/chunks/4383.279c432baad923c3.js',
          revision: '279c432baad923c3',
        },
        {
          url: '/_next/static/chunks/4757-4217947ff7a02d6d.js',
          revision: '4217947ff7a02d6d',
        },
        {
          url: '/_next/static/chunks/4909-5b84ef3be4b6f0dd.js',
          revision: '5b84ef3be4b6f0dd',
        },
        {
          url: '/_next/static/chunks/4bd1b696-100b9d70ed4e49c1.js',
          revision: '100b9d70ed4e49c1',
        },
        {
          url: '/_next/static/chunks/5125-a51407a3721216f6.js',
          revision: 'a51407a3721216f6',
        },
        {
          url: '/_next/static/chunks/5139.bab70807d9ac195a.js',
          revision: 'bab70807d9ac195a',
        },
        {
          url: '/_next/static/chunks/5239-cf836f5194924c02.js',
          revision: 'cf836f5194924c02',
        },
        {
          url: '/_next/static/chunks/52774a7f-53d685274bec05a4.js',
          revision: '53d685274bec05a4',
        },
        {
          url: '/_next/static/chunks/5314-e89adb606ecdcf61.js',
          revision: 'e89adb606ecdcf61',
        },
        {
          url: '/_next/static/chunks/5998-56b8e99f4683b732.js',
          revision: '56b8e99f4683b732',
        },
        {
          url: '/_next/static/chunks/6019-9241aa2b22ed9bf1.js',
          revision: '9241aa2b22ed9bf1',
        },
        {
          url: '/_next/static/chunks/6119-6155b3a6953338d6.js',
          revision: '6155b3a6953338d6',
        },
        {
          url: '/_next/static/chunks/630-7aa80eb5745014c6.js',
          revision: '7aa80eb5745014c6',
        },
        {
          url: '/_next/static/chunks/772-09071c706bf130aa.js',
          revision: '09071c706bf130aa',
        },
        {
          url: '/_next/static/chunks/7729-9c3b4ed3786a12c1.js',
          revision: '9c3b4ed3786a12c1',
        },
        {
          url: '/_next/static/chunks/7750.10f22d5a11709912.js',
          revision: '10f22d5a11709912',
        },
        {
          url: '/_next/static/chunks/7766-eb27a3c638bc654b.js',
          revision: 'eb27a3c638bc654b',
        },
        {
          url: '/_next/static/chunks/7802-6987aa7c5641c8ff.js',
          revision: '6987aa7c5641c8ff',
        },
        {
          url: '/_next/static/chunks/7943-373f98d6f9545175.js',
          revision: '373f98d6f9545175',
        },
        {
          url: '/_next/static/chunks/8171-5d5397dce2184e80.js',
          revision: '5d5397dce2184e80',
        },
        {
          url: '/_next/static/chunks/8342-878b27b59c22b85b.js',
          revision: '878b27b59c22b85b',
        },
        {
          url: '/_next/static/chunks/8519-ee0352f3367b4925.js',
          revision: 'ee0352f3367b4925',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-bef8e0260520c778.js',
          revision: 'bef8e0260520c778',
        },
        {
          url: '/_next/static/chunks/905-b8316ff981a23da3.js',
          revision: 'b8316ff981a23da3',
        },
        {
          url: '/_next/static/chunks/9061-b4803daad0fb135d.js',
          revision: 'b4803daad0fb135d',
        },
        {
          url: '/_next/static/chunks/9315.d1bd2b3c7388fa4c.js',
          revision: 'd1bd2b3c7388fa4c',
        },
        {
          url: '/_next/static/chunks/9486-af655ed5f602d658.js',
          revision: 'af655ed5f602d658',
        },
        {
          url: '/_next/static/chunks/9507-a121bd368e727527.js',
          revision: 'a121bd368e727527',
        },
        {
          url: '/_next/static/chunks/960-98be1416033270a6.js',
          revision: '98be1416033270a6',
        },
        {
          url: '/_next/static/chunks/9764-01dcd67683c2616d.js',
          revision: '01dcd67683c2616d',
        },
        {
          url: '/_next/static/chunks/9997-9caadf36f89e30d3.js',
          revision: '9caadf36f89e30d3',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-8214ae21d9aa7eb2.js',
          revision: '8214ae21d9aa7eb2',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-fa75e1b22a7cdc77.js',
          revision: 'fa75e1b22a7cdc77',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-3c9ee799be4beafb.js',
          revision: '3c9ee799be4beafb',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-153116badb758403.js',
          revision: '153116badb758403',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/page-3f57dd6f19c5905d.js',
          revision: '3f57dd6f19c5905d',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/ros/page-4ab02a6e9879f4d4.js',
          revision: '4ab02a6e9879f4d4',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-4e2164bb490d30ce.js',
          revision: '4e2164bb490d30ce',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-f7006877cd38dae1.js',
          revision: 'f7006877cd38dae1',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-a16760e52f20efda.js',
          revision: 'a16760e52f20efda',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-b07854100b081d9b.js',
          revision: 'b07854100b081d9b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-4afc78f42e0dd271.js',
          revision: '4afc78f42e0dd271',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-702caa6e7cdd6d84.js',
          revision: '702caa6e7cdd6d84',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-3f57dd6f19c5905d.js',
          revision: '3f57dd6f19c5905d',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-3945c45e79a8da8b.js',
          revision: '3945c45e79a8da8b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-56af5d468cb1c998.js',
          revision: '56af5d468cb1c998',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-f246b411715b90ff.js',
          revision: 'f246b411715b90ff',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-976a95ce8908e3e3.js',
          revision: '976a95ce8908e3e3',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-c386f3381a419178.js',
          revision: 'c386f3381a419178',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-27ae8acaafdaf8b9.js',
          revision: '27ae8acaafdaf8b9',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-6ef90b8772c6d4a1.js',
          revision: '6ef90b8772c6d4a1',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-38427bfd0e2929a9.js',
          revision: '38427bfd0e2929a9',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-1f1789a6ce4056d1.js',
          revision: '1f1789a6ce4056d1',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-0ee94a8d6908766a.js',
          revision: '0ee94a8d6908766a',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-d0cae3296bd9210c.js',
          revision: 'd0cae3296bd9210c',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-4b14f3bf8e177121.js',
          revision: '4b14f3bf8e177121',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-ebe773672ca44325.js',
          revision: 'ebe773672ca44325',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-3f57dd6f19c5905d.js',
          revision: '3f57dd6f19c5905d',
        },
        {
          url: '/_next/static/chunks/app/api/proxy/(proxy)/%5B...path%5D/route-3f57dd6f19c5905d.js',
          revision: '3f57dd6f19c5905d',
        },
        {
          url: '/_next/static/chunks/app/api/sentry-example-api/route-3f57dd6f19c5905d.js',
          revision: '3f57dd6f19c5905d',
        },
        {
          url: '/_next/static/chunks/app/api/test-proxy/route-3f57dd6f19c5905d.js',
          revision: '3f57dd6f19c5905d',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-daca885544ef345e.js',
          revision: 'daca885544ef345e',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-f9c27d4a4df123c8.js',
          revision: 'f9c27d4a4df123c8',
        },
        {
          url: '/_next/static/chunks/app/error-81549432a3a5c3e7.js',
          revision: '81549432a3a5c3e7',
        },
        {
          url: '/_next/static/chunks/app/global-error-527eb891c1a84df1.js',
          revision: '527eb891c1a84df1',
        },
        {
          url: '/_next/static/chunks/app/layout-9b3792b45ab9e6c3.js',
          revision: '9b3792b45ab9e6c3',
        },
        {
          url: '/_next/static/chunks/app/not-found-ec4d5c6e96fe46da.js',
          revision: 'ec4d5c6e96fe46da',
        },
        {
          url: '/_next/static/chunks/app/page-0c3ccd5ea3b23a92.js',
          revision: '0c3ccd5ea3b23a92',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-15026ed0296e0645.js',
          revision: '15026ed0296e0645',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-0223adfe5e4f5f4f.js',
          revision: '0223adfe5e4f5f4f',
        },
        {
          url: '/_next/static/chunks/framework-32492dd9c4fc5870.js',
          revision: '32492dd9c4fc5870',
        },
        {
          url: '/_next/static/chunks/main-app-2b71b5d467702072.js',
          revision: '2b71b5d467702072',
        },
        {
          url: '/_next/static/chunks/main-c9256d8b92bd7750.js',
          revision: 'c9256d8b92bd7750',
        },
        {
          url: '/_next/static/chunks/pages/_app-0e1cfad74bede4be.js',
          revision: '0e1cfad74bede4be',
        },
        {
          url: '/_next/static/chunks/pages/_error-d5437e6632e42397.js',
          revision: 'd5437e6632e42397',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-2d15a67b8d43fe8d.js',
          revision: '2d15a67b8d43fe8d',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css',
          revision: '041aafb0eaf4613c',
        },
        {
          url: '/_next/static/css/8cbd000aece22e74.css',
          revision: '8cbd000aece22e74',
        },
        {
          url: '/_next/static/css/9140a8a31a1d3f61.css',
          revision: '9140a8a31a1d3f61',
        },
        {
          url: '/_next/static/css/96ceef82eedee5d2.css',
          revision: '96ceef82eedee5d2',
        },
        {
          url: '/_next/static/m3OVRlTS92HQWhvgfRrHb/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
          revision: '9dda5cfc9a46f256d0e131bb535e46f8',
        },
        {
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
          revision: '4e2553027f1d60eff32898367dd4d541',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
          revision: '9e494903d6b0ffec1a1e14d34427d44d',
        },
        {
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
          revision: '027a89e9ab733a145db70f09b8a18b42',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        { url: '/favicon.ico', revision: 'd674d0b708bdf71d2fedd2986407ef40' },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/icon-192.png', revision: 'd674d0b708bdf71d2fedd2986407ef40' },
        { url: '/icon-512.png', revision: 'd674d0b708bdf71d2fedd2986407ef40' },
        {
          url: '/icons/icon-maskable.svg',
          revision: 'b30b9afd20c153444d42f544ca8642dd',
        },
        {
          url: '/icons/icon-monochrome.svg',
          revision: 'bd5fecaf75ae3c3f6a5ae2fda6b17a96',
        },
        {
          url: '/icons/icon.svg',
          revision: '1ff218f02ca0fd51a10c364ee2969d75',
        },
        {
          url: '/icons/novunt.png',
          revision: '0c99c2df78b6133fc1f04f5246d49fcd',
        },
        {
          url: '/icons/novunt_short.png',
          revision: 'd674d0b708bdf71d2fedd2986407ef40',
        },
        { url: '/manifest.json', revision: 'a9d989252a7dec77955b440f93b300ec' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/offline.html', revision: '6516ea44af587db50a1f6dd78cc9333d' },
        { url: '/vault-bg.jpg', revision: 'a077d02187985aa59a732428a34d65fc' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: s,
              state: c,
            }) =>
              a && 'opaqueredirect' === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: a.headers,
                  })
                : a,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https?.*/,
      new e.NetworkFirst({
        cacheName: 'offlineCache',
        plugins: [new e.ExpirationPlugin({ maxEntries: 200 })],
      }),
      'GET'
    ));
});
