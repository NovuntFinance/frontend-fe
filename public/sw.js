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
      b = { module: { uri: n }, exports: t, require: d };
    a[n] = Promise.all(c.map((e) => b[e] || d(e))).then((e) => (i(...e), t));
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
          url: '/_next/static/W7v2Ix7WGeuvuuMu7ZyPG/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/145-79d3e9556de9e18a.js',
          revision: '79d3e9556de9e18a',
        },
        {
          url: '/_next/static/chunks/145-79d3e9556de9e18a.js.map',
          revision: '23e49c662c2140259e54e364b337efc5',
        },
        {
          url: '/_next/static/chunks/1528-136e240878686b15.js',
          revision: '136e240878686b15',
        },
        {
          url: '/_next/static/chunks/1528-136e240878686b15.js.map',
          revision: '3c3a1636f74400dd0d28a3110c836069',
        },
        {
          url: '/_next/static/chunks/1555-b92118d208717329.js',
          revision: 'b92118d208717329',
        },
        {
          url: '/_next/static/chunks/1555-b92118d208717329.js.map',
          revision: '67a969929148e71706256a4beb2cc174',
        },
        {
          url: '/_next/static/chunks/1640-dc11537e749daf33.js',
          revision: 'dc11537e749daf33',
        },
        {
          url: '/_next/static/chunks/1640-dc11537e749daf33.js.map',
          revision: 'fcb7236926567543f3266cd079a93886',
        },
        {
          url: '/_next/static/chunks/1646.12b33b30693a1f57.js',
          revision: '12b33b30693a1f57',
        },
        {
          url: '/_next/static/chunks/1646.12b33b30693a1f57.js.map',
          revision: '8229d14519315f3dbf48d391a223ec2a',
        },
        {
          url: '/_next/static/chunks/1822-185177f06910756d.js',
          revision: '185177f06910756d',
        },
        {
          url: '/_next/static/chunks/1822-185177f06910756d.js.map',
          revision: 'ec61cc5f8b50ced13824e04a3f640763',
        },
        {
          url: '/_next/static/chunks/2454-e7b8c11cc3a965ac.js',
          revision: 'e7b8c11cc3a965ac',
        },
        {
          url: '/_next/static/chunks/2454-e7b8c11cc3a965ac.js.map',
          revision: '3a15b2e0191b3eebe6ac7d9582bb4f39',
        },
        {
          url: '/_next/static/chunks/2619-741d1debdecabf86.js',
          revision: '741d1debdecabf86',
        },
        {
          url: '/_next/static/chunks/2619-741d1debdecabf86.js.map',
          revision: '8b58e369517c869291bab0630fe223dc',
        },
        {
          url: '/_next/static/chunks/295-b5eb64ac1b43ceab.js',
          revision: 'b5eb64ac1b43ceab',
        },
        {
          url: '/_next/static/chunks/295-b5eb64ac1b43ceab.js.map',
          revision: 'b1eb2b52605a0a4985cb4fdcb4ff4d86',
        },
        {
          url: '/_next/static/chunks/2985.d3f0458ac1397530.js',
          revision: 'd3f0458ac1397530',
        },
        {
          url: '/_next/static/chunks/2985.d3f0458ac1397530.js.map',
          revision: '7fab232a6efb8b7c4e226ffb219b8911',
        },
        {
          url: '/_next/static/chunks/30a37ab2-7ca6ffc2e31c29fe.js',
          revision: '7ca6ffc2e31c29fe',
        },
        {
          url: '/_next/static/chunks/3148-121a278b557e2dd3.js',
          revision: '121a278b557e2dd3',
        },
        {
          url: '/_next/static/chunks/3148-121a278b557e2dd3.js.map',
          revision: '21232ccb3be5cefee65e668c1a316877',
        },
        {
          url: '/_next/static/chunks/3361.03412dd119fe588f.js',
          revision: '03412dd119fe588f',
        },
        {
          url: '/_next/static/chunks/3361.03412dd119fe588f.js.map',
          revision: '21d30969c737fc0351054632fbf27285',
        },
        {
          url: '/_next/static/chunks/3409-dc2d358ba9e215e3.js',
          revision: 'dc2d358ba9e215e3',
        },
        {
          url: '/_next/static/chunks/3409-dc2d358ba9e215e3.js.map',
          revision: '9b4fce10704d23e16dfc129e2ecb5c97',
        },
        {
          url: '/_next/static/chunks/3588-65ec78cd5536725f.js',
          revision: '65ec78cd5536725f',
        },
        {
          url: '/_next/static/chunks/3588-65ec78cd5536725f.js.map',
          revision: '43528817af49f56315b18604a118d4dd',
        },
        {
          url: '/_next/static/chunks/3735-a2becf7733546824.js',
          revision: 'a2becf7733546824',
        },
        {
          url: '/_next/static/chunks/3735-a2becf7733546824.js.map',
          revision: '1f6f71b28ca9810426c155677bc3862d',
        },
        {
          url: '/_next/static/chunks/4038-bbe19f546b0b2a87.js',
          revision: 'bbe19f546b0b2a87',
        },
        {
          url: '/_next/static/chunks/4038-bbe19f546b0b2a87.js.map',
          revision: '11ad1f7d4c02946d228694e2723bc1e4',
        },
        {
          url: '/_next/static/chunks/4193-91af5cfd49fe5f9c.js',
          revision: '91af5cfd49fe5f9c',
        },
        {
          url: '/_next/static/chunks/4193-91af5cfd49fe5f9c.js.map',
          revision: '9c63024a21ff3bdc19f4db744c53969c',
        },
        {
          url: '/_next/static/chunks/4383.8c7f47da988b328b.js',
          revision: '8c7f47da988b328b',
        },
        {
          url: '/_next/static/chunks/4383.8c7f47da988b328b.js.map',
          revision: '0d0f9d5c1ef71fd796cbbb0114f300d5',
        },
        {
          url: '/_next/static/chunks/4531-21261ec32d2e8aff.js',
          revision: '21261ec32d2e8aff',
        },
        {
          url: '/_next/static/chunks/4531-21261ec32d2e8aff.js.map',
          revision: 'ed2213a84bcb2cb85979f8789a6fc874',
        },
        {
          url: '/_next/static/chunks/4883-6b1ea43468a9601a.js',
          revision: '6b1ea43468a9601a',
        },
        {
          url: '/_next/static/chunks/4883-6b1ea43468a9601a.js.map',
          revision: '03009b9e963dc07d0678f872f46ce633',
        },
        {
          url: '/_next/static/chunks/4909-9d6d85837511f493.js',
          revision: '9d6d85837511f493',
        },
        {
          url: '/_next/static/chunks/4909-9d6d85837511f493.js.map',
          revision: '7d6382a0dde0e30e4febd311a2eba73a',
        },
        {
          url: '/_next/static/chunks/4bd1b696-64498adba8efdb2e.js',
          revision: '64498adba8efdb2e',
        },
        {
          url: '/_next/static/chunks/4bd1b696-64498adba8efdb2e.js.map',
          revision: 'e51f220adfbf0d118b57ab53ac90220d',
        },
        {
          url: '/_next/static/chunks/5125-0bd362f21c26ae6e.js',
          revision: '0bd362f21c26ae6e',
        },
        {
          url: '/_next/static/chunks/5125-0bd362f21c26ae6e.js.map',
          revision: '127aa7f3961855f4c1136042e585f4e6',
        },
        {
          url: '/_next/static/chunks/5139.b45c251335b3babe.js',
          revision: 'b45c251335b3babe',
        },
        {
          url: '/_next/static/chunks/5139.b45c251335b3babe.js.map',
          revision: '375ed209ae2b3bb49a81013a77014f48',
        },
        {
          url: '/_next/static/chunks/5149-55b2119263d87cf5.js',
          revision: '55b2119263d87cf5',
        },
        {
          url: '/_next/static/chunks/5149-55b2119263d87cf5.js.map',
          revision: 'a2414cf3460a84383ce8531f75f38da5',
        },
        {
          url: '/_next/static/chunks/5239-d4e6e96d5976e34c.js',
          revision: 'd4e6e96d5976e34c',
        },
        {
          url: '/_next/static/chunks/5239-d4e6e96d5976e34c.js.map',
          revision: 'b812e396cd6db9c18a5e7a8889e475a2',
        },
        {
          url: '/_next/static/chunks/52774a7f-10d3682eacf6ebaa.js',
          revision: '10d3682eacf6ebaa',
        },
        {
          url: '/_next/static/chunks/52774a7f-10d3682eacf6ebaa.js.map',
          revision: '72776d26fcc66a77d26d6cb31024444c',
        },
        {
          url: '/_next/static/chunks/5932-90776bc4a6d711f8.js',
          revision: '90776bc4a6d711f8',
        },
        {
          url: '/_next/static/chunks/5932-90776bc4a6d711f8.js.map',
          revision: 'c660efadc2201234a755818f62a1c3e5',
        },
        {
          url: '/_next/static/chunks/6285-8dc4900c09b721f5.js',
          revision: '8dc4900c09b721f5',
        },
        {
          url: '/_next/static/chunks/6285-8dc4900c09b721f5.js.map',
          revision: 'b22969bdf7d2d24e91dbeab2376d6100',
        },
        {
          url: '/_next/static/chunks/6288-55f2b5a4a8f257ef.js',
          revision: '55f2b5a4a8f257ef',
        },
        {
          url: '/_next/static/chunks/6288-55f2b5a4a8f257ef.js.map',
          revision: 'e31f84244b86455b6b138e6cb30edcfb',
        },
        {
          url: '/_next/static/chunks/6387-54526bb35d85a3dc.js',
          revision: '54526bb35d85a3dc',
        },
        {
          url: '/_next/static/chunks/6387-54526bb35d85a3dc.js.map',
          revision: '66a5af04d0ec5a11e103ec2b061d0be7',
        },
        {
          url: '/_next/static/chunks/6421-260eb1d4411ab587.js',
          revision: '260eb1d4411ab587',
        },
        {
          url: '/_next/static/chunks/6421-260eb1d4411ab587.js.map',
          revision: 'b9763b476229dddb56868e44a9f47415',
        },
        {
          url: '/_next/static/chunks/6743-fd7d009838df3c6c.js',
          revision: 'fd7d009838df3c6c',
        },
        {
          url: '/_next/static/chunks/6743-fd7d009838df3c6c.js.map',
          revision: '3225112eb2e131dcfcee3bab61c34480',
        },
        {
          url: '/_next/static/chunks/7698-d3f76ce9bdbf27eb.js',
          revision: 'd3f76ce9bdbf27eb',
        },
        {
          url: '/_next/static/chunks/7698-d3f76ce9bdbf27eb.js.map',
          revision: 'd203abf517176f8208451fcf753a8c72',
        },
        {
          url: '/_next/static/chunks/7729-66136466f9536d83.js',
          revision: '66136466f9536d83',
        },
        {
          url: '/_next/static/chunks/7729-66136466f9536d83.js.map',
          revision: 'cf039bbe968f4194e9ab8ce764e513be',
        },
        {
          url: '/_next/static/chunks/7750.e3f13fc25cf26c9f.js',
          revision: 'e3f13fc25cf26c9f',
        },
        {
          url: '/_next/static/chunks/7750.e3f13fc25cf26c9f.js.map',
          revision: 'e7fd937f64409f61d00a9b410d40b4df',
        },
        {
          url: '/_next/static/chunks/8156-43f0b3c9760fa6a8.js',
          revision: '43f0b3c9760fa6a8',
        },
        {
          url: '/_next/static/chunks/8156-43f0b3c9760fa6a8.js.map',
          revision: 'ffb66611ff3f5a35bd998d6c4e2f8679',
        },
        {
          url: '/_next/static/chunks/869-86f4623762868af1.js',
          revision: '86f4623762868af1',
        },
        {
          url: '/_next/static/chunks/869-86f4623762868af1.js.map',
          revision: '270d087b7b898107d5a468938ddcc44f',
        },
        {
          url: '/_next/static/chunks/8700-ab94561800e9ed60.js',
          revision: 'ab94561800e9ed60',
        },
        {
          url: '/_next/static/chunks/8700-ab94561800e9ed60.js.map',
          revision: 'e59c2e609caa38e5832052f4ac9d9e9d',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-9ad0890e63b62aaa.js',
          revision: '9ad0890e63b62aaa',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-9ad0890e63b62aaa.js.map',
          revision: '9386f9817d35995215ebcfc953aec804',
        },
        {
          url: '/_next/static/chunks/905-6ea93dc9d34ad460.js',
          revision: '6ea93dc9d34ad460',
        },
        {
          url: '/_next/static/chunks/905-6ea93dc9d34ad460.js.map',
          revision: 'cbf9708869e7530e639d436272738e66',
        },
        {
          url: '/_next/static/chunks/9069-bbfcdafaef852222.js',
          revision: 'bbfcdafaef852222',
        },
        {
          url: '/_next/static/chunks/9069-bbfcdafaef852222.js.map',
          revision: '3ba17a8f8858b3545b78f82943645bd6',
        },
        {
          url: '/_next/static/chunks/9315.a865d275e73748a0.js',
          revision: 'a865d275e73748a0',
        },
        {
          url: '/_next/static/chunks/9315.a865d275e73748a0.js.map',
          revision: '33b7e90c06397b285f8011f0cc317c75',
        },
        {
          url: '/_next/static/chunks/9486-298d027c0b893e7e.js',
          revision: '298d027c0b893e7e',
        },
        {
          url: '/_next/static/chunks/9486-298d027c0b893e7e.js.map',
          revision: '2d04e5fdf06dc0cfc3f5819ebdcb62ff',
        },
        {
          url: '/_next/static/chunks/9516-267b194f6d85af95.js',
          revision: '267b194f6d85af95',
        },
        {
          url: '/_next/static/chunks/9516-267b194f6d85af95.js.map',
          revision: '1f3ee6f90504d8c2b53fcc777d9e2278',
        },
        {
          url: '/_next/static/chunks/960-f5e2fcd6ed9fdd3a.js',
          revision: 'f5e2fcd6ed9fdd3a',
        },
        {
          url: '/_next/static/chunks/960-f5e2fcd6ed9fdd3a.js.map',
          revision: 'f963849bab60a5e6719345c61bec4b28',
        },
        {
          url: '/_next/static/chunks/9764-004fc9403518fe9e.js',
          revision: '004fc9403518fe9e',
        },
        {
          url: '/_next/static/chunks/9764-004fc9403518fe9e.js.map',
          revision: '10023724e7e694b1ce6da51d8222f608',
        },
        {
          url: '/_next/static/chunks/9881-f69ade76ba4cf282.js',
          revision: 'f69ade76ba4cf282',
        },
        {
          url: '/_next/static/chunks/9881-f69ade76ba4cf282.js.map',
          revision: '27633357e00b6c14236fcf07923b80b9',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-5c4b43312a600ffd.js',
          revision: '5c4b43312a600ffd',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-5c4b43312a600ffd.js.map',
          revision: 'af44354807fec2358e59bd8963943319',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-5ac5029d5ef9f2ad.js',
          revision: '5ac5029d5ef9f2ad',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-5ac5029d5ef9f2ad.js.map',
          revision: '5081858698d22d55df43aa85cd07e197',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-87b40ac20d620989.js',
          revision: '87b40ac20d620989',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-87b40ac20d620989.js.map',
          revision: '28541ca5b56e1bb65adbdab29c3f4f4d',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-31cfa13f38657d04.js',
          revision: '31cfa13f38657d04',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-31cfa13f38657d04.js.map',
          revision: 'e3ac02ec63a39c2196fef841506a1d42',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/page-8c56b4c4db929813.js',
          revision: '8c56b4c4db929813',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-931156378e9e2107.js',
          revision: '931156378e9e2107',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-931156378e9e2107.js.map',
          revision: 'e57fe62b2cbda66ea1e3f659d9fcdbf6',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-ba54685482bc632f.js',
          revision: 'ba54685482bc632f',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-ba54685482bc632f.js.map',
          revision: 'f9950286f19b31606d9115df5d596e26',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-eeb5c77523414b83.js',
          revision: 'eeb5c77523414b83',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-eeb5c77523414b83.js.map',
          revision: 'af920e32f7f8968ddbec485b8140bd11',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-d6cb5a1798c87620.js',
          revision: 'd6cb5a1798c87620',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-d6cb5a1798c87620.js.map',
          revision: 'be6b87eb23a524c962a0a78e8882632a',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-625c627cd0fa1816.js',
          revision: '625c627cd0fa1816',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-625c627cd0fa1816.js.map',
          revision: '870a91807dc58044ccca7042eb516eae',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-7c6076c01192246b.js',
          revision: '7c6076c01192246b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-7c6076c01192246b.js.map',
          revision: '8d8adcb217887afaa29f278f5493f64e',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-789554f903de353b.js',
          revision: '789554f903de353b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-79aee6d4c77e9355.js',
          revision: '79aee6d4c77e9355',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-79aee6d4c77e9355.js.map',
          revision: '14e292493b178725bdc07d5a8cd9afe1',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-85a5da39ef13fe45.js',
          revision: '85a5da39ef13fe45',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-85a5da39ef13fe45.js.map',
          revision: '6fb6f70ebb4c063c44d2dbf979675342',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-c813286d6ba7e726.js',
          revision: 'c813286d6ba7e726',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-c813286d6ba7e726.js.map',
          revision: '281e69a8440e0dfd76c7b95443c4ff71',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/bonuses/page-9ee534cd2d0387b7.js',
          revision: '9ee534cd2d0387b7',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/bonuses/page-9ee534cd2d0387b7.js.map',
          revision: 'a809680eca450b3cc4fb237ce6fd0ea4',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-0d42a5fa1e391fc7.js',
          revision: '0d42a5fa1e391fc7',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-0d42a5fa1e391fc7.js.map',
          revision: 'a4924fbdf1ac1032d0fb019364cd1a80',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-932ae5a5a4563ef6.js',
          revision: '932ae5a5a4563ef6',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-932ae5a5a4563ef6.js.map',
          revision: 'e82c686322e09793a0598ab2cbc98267',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-a8ec193204f39785.js',
          revision: 'a8ec193204f39785',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-a8ec193204f39785.js.map',
          revision: '1d1ddb5baea792cb86f69bbddb0f2645',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-0adb8671b1e100e8.js',
          revision: '0adb8671b1e100e8',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-0adb8671b1e100e8.js.map',
          revision: 'a949578d72c4201e594b8c4f7253b51a',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-e1ba6cdca1f475dd.js',
          revision: 'e1ba6cdca1f475dd',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-e1ba6cdca1f475dd.js.map',
          revision: 'c3059067ef7554ef3cad1a8859ae40b1',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-58cb4bce41dc0aa2.js',
          revision: '58cb4bce41dc0aa2',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-58cb4bce41dc0aa2.js.map',
          revision: '834fe270f906dd123a30a16487dd1c5e',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-3144b3b71b8f9430.js',
          revision: '3144b3b71b8f9430',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-3144b3b71b8f9430.js.map',
          revision: 'e3da577019db39e2dfdd48b19481087f',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/transactions/page-e53141dfd51abb79.js',
          revision: 'e53141dfd51abb79',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/transactions/page-e53141dfd51abb79.js.map',
          revision: '92ac3456bdc5b0c0158abb2b3d126c61',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-d3cc527920d8a57c.js',
          revision: 'd3cc527920d8a57c',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-d3cc527920d8a57c.js.map',
          revision: 'b066e78f54fe202b87da02a984babf07',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-9f86cf7e0a4540d7.js',
          revision: '9f86cf7e0a4540d7',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-9f86cf7e0a4540d7.js.map',
          revision: '994b37bd57e2eb2ee2556909b4f4b7ed',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-006c143b9b125783.js',
          revision: '006c143b9b125783',
        },
        {
          url: '/_next/static/chunks/app/api/proxy/(proxy)/%5B...path%5D/route-a3ab7bb7f3964509.js',
          revision: 'a3ab7bb7f3964509',
        },
        {
          url: '/_next/static/chunks/app/api/sentry-example-api/route-0fe69c38574ea5f4.js',
          revision: '0fe69c38574ea5f4',
        },
        {
          url: '/_next/static/chunks/app/api/test-proxy/route-895f12f011146f93.js',
          revision: '895f12f011146f93',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-c73ebdfcfbb70042.js',
          revision: 'c73ebdfcfbb70042',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-c73ebdfcfbb70042.js.map',
          revision: '4fd0179b40d04d9697633014af377132',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-9b6ea3860c64e50a.js',
          revision: '9b6ea3860c64e50a',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-9b6ea3860c64e50a.js.map',
          revision: 'b9c76a21b9d60de8a2fbcfda69b1e68f',
        },
        {
          url: '/_next/static/chunks/app/error-12f6aab1a5b7207d.js',
          revision: '12f6aab1a5b7207d',
        },
        {
          url: '/_next/static/chunks/app/error-12f6aab1a5b7207d.js.map',
          revision: '28dead263a31455584b461251bb4e7db',
        },
        {
          url: '/_next/static/chunks/app/global-error-c9c29ab545326ec8.js',
          revision: 'c9c29ab545326ec8',
        },
        {
          url: '/_next/static/chunks/app/global-error-c9c29ab545326ec8.js.map',
          revision: 'a3830181b522657c42f23637b7e1f1bd',
        },
        {
          url: '/_next/static/chunks/app/layout-b43ed23ddd0f098c.js',
          revision: 'b43ed23ddd0f098c',
        },
        {
          url: '/_next/static/chunks/app/layout-b43ed23ddd0f098c.js.map',
          revision: '0b7f7b4477c06462f981c40bc6f6016d',
        },
        {
          url: '/_next/static/chunks/app/not-found-1384d72dc5d562f2.js',
          revision: '1384d72dc5d562f2',
        },
        {
          url: '/_next/static/chunks/app/not-found-1384d72dc5d562f2.js.map',
          revision: '90b263f7fdf099a9828ea09fce6394b9',
        },
        {
          url: '/_next/static/chunks/app/page-591c0144c2b90205.js',
          revision: '591c0144c2b90205',
        },
        {
          url: '/_next/static/chunks/app/page-591c0144c2b90205.js.map',
          revision: '95ec9ebdb71dd095d7b0d68d9c9c22f7',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-8df4d211d39d6480.js',
          revision: '8df4d211d39d6480',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-8df4d211d39d6480.js.map',
          revision: 'fbd815085534e264088fb4f12f41e3f7',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-ab24c84676b7969a.js',
          revision: 'ab24c84676b7969a',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-ab24c84676b7969a.js.map',
          revision: 'fbb10851dfa4ed5efa16c1559616d592',
        },
        {
          url: '/_next/static/chunks/framework-95abbcfd013613b2.js',
          revision: '95abbcfd013613b2',
        },
        {
          url: '/_next/static/chunks/framework-95abbcfd013613b2.js.map',
          revision: 'e7ebd68c2422d7615c4b864b1df5f34a',
        },
        {
          url: '/_next/static/chunks/main-app-9cfe48f6c5e7678d.js',
          revision: '9cfe48f6c5e7678d',
        },
        {
          url: '/_next/static/chunks/main-app-9cfe48f6c5e7678d.js.map',
          revision: 'b5da5b77e5532b507edc80acfbfe81e3',
        },
        {
          url: '/_next/static/chunks/main-e568719934178a93.js',
          revision: 'e568719934178a93',
        },
        {
          url: '/_next/static/chunks/main-e568719934178a93.js.map',
          revision: '57be42a5afab395b65082c5cbdbb08f7',
        },
        {
          url: '/_next/static/chunks/pages/_app-b5709606502fc039.js',
          revision: 'b5709606502fc039',
        },
        {
          url: '/_next/static/chunks/pages/_app-b5709606502fc039.js.map',
          revision: 'cac3d501d06313ee4a9e5fde00780ce8',
        },
        {
          url: '/_next/static/chunks/pages/_error-b579789578b8a505.js',
          revision: 'b579789578b8a505',
        },
        {
          url: '/_next/static/chunks/pages/_error-b579789578b8a505.js.map',
          revision: '854f8f999fa6313326f4d361e1d5fcd2',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-fca62468f2c6cca8.js',
          revision: 'fca62468f2c6cca8',
        },
        {
          url: '/_next/static/chunks/webpack-fca62468f2c6cca8.js.map',
          revision: '6d23395c07594b700b16793703c05467',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css',
          revision: '041aafb0eaf4613c',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css.map',
          revision: '201ebc6f10f84f87498aa9c3524a4d8d',
        },
        {
          url: '/_next/static/css/8cbd000aece22e74.css',
          revision: '8cbd000aece22e74',
        },
        {
          url: '/_next/static/css/8cbd000aece22e74.css.map',
          revision: '44cdee9a02b75bcf97682d200e298d25',
        },
        {
          url: '/_next/static/css/96ceef82eedee5d2.css',
          revision: '96ceef82eedee5d2',
        },
        {
          url: '/_next/static/css/96ceef82eedee5d2.css.map',
          revision: '78f65a72a230168169feb81d41ed3b43',
        },
        {
          url: '/_next/static/css/9e5194e14b29aa27.css',
          revision: '9e5194e14b29aa27',
        },
        {
          url: '/_next/static/css/9e5194e14b29aa27.css.map',
          revision: 'c28384f43358636de9bd7179da12cb3d',
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
//# sourceMappingURL=sw.js.map
