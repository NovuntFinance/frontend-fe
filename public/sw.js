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
    let d = {};
    const t = (e) => s(e, n),
      b = { module: { uri: n }, exports: d, require: t };
    a[n] = Promise.all(c.map((e) => b[e] || t(e))).then((e) => (i(...e), d));
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
          url: '/_next/static/chunks/1109-a5a475e6aa3b9f42.js',
          revision: 'a5a475e6aa3b9f42',
        },
        {
          url: '/_next/static/chunks/1109-a5a475e6aa3b9f42.js.map',
          revision: '46e90baa8fb2919cddfbb753952fd2e8',
        },
        {
          url: '/_next/static/chunks/1258.673e9e404f147857.js',
          revision: '673e9e404f147857',
        },
        {
          url: '/_next/static/chunks/1258.673e9e404f147857.js.map',
          revision: '9bcd3bb21d007fc62d7170bfe37af485',
        },
        {
          url: '/_next/static/chunks/1265-5b1011cd8e5c06bd.js',
          revision: '5b1011cd8e5c06bd',
        },
        {
          url: '/_next/static/chunks/1265-5b1011cd8e5c06bd.js.map',
          revision: '22a4dad136db828237b57165647532d6',
        },
        {
          url: '/_next/static/chunks/1506-a7ca7a9ae8eb2cc5.js',
          revision: 'a7ca7a9ae8eb2cc5',
        },
        {
          url: '/_next/static/chunks/1506-a7ca7a9ae8eb2cc5.js.map',
          revision: '50408e64dcc81d386415ce7fa51a072b',
        },
        {
          url: '/_next/static/chunks/1605-38ffaea1651a040b.js',
          revision: '38ffaea1651a040b',
        },
        {
          url: '/_next/static/chunks/1605-38ffaea1651a040b.js.map',
          revision: '07a3c1a2f96b27c74ec7e11822ef3bf2',
        },
        {
          url: '/_next/static/chunks/1643-da021ea6505e343e.js',
          revision: 'da021ea6505e343e',
        },
        {
          url: '/_next/static/chunks/1643-da021ea6505e343e.js.map',
          revision: 'f5778aca462d7cdd9433d230cf4998da',
        },
        {
          url: '/_next/static/chunks/1646.45d014c16fd881b5.js',
          revision: '45d014c16fd881b5',
        },
        {
          url: '/_next/static/chunks/1646.45d014c16fd881b5.js.map',
          revision: '3c03f9503c0946355becc56155837d60',
        },
        {
          url: '/_next/static/chunks/1884-e706d6d3c08c6411.js',
          revision: 'e706d6d3c08c6411',
        },
        {
          url: '/_next/static/chunks/1884-e706d6d3c08c6411.js.map',
          revision: 'd4fe9d81314b9974bca195545e1b25dc',
        },
        {
          url: '/_next/static/chunks/2256-d575144d14a6f744.js',
          revision: 'd575144d14a6f744',
        },
        {
          url: '/_next/static/chunks/2256-d575144d14a6f744.js.map',
          revision: '7bcf666ebe917dd4cf411c2800804c8c',
        },
        {
          url: '/_next/static/chunks/2275-e53e175dd3980b69.js',
          revision: 'e53e175dd3980b69',
        },
        {
          url: '/_next/static/chunks/2275-e53e175dd3980b69.js.map',
          revision: '16e4838d4eee02494c7e805d0d101922',
        },
        {
          url: '/_next/static/chunks/2454-9f75d0b3fa3a1987.js',
          revision: '9f75d0b3fa3a1987',
        },
        {
          url: '/_next/static/chunks/2454-9f75d0b3fa3a1987.js.map',
          revision: 'f859e1b7974056809b1a64772521bd59',
        },
        {
          url: '/_next/static/chunks/2614-2a6709e7086ee84b.js',
          revision: '2a6709e7086ee84b',
        },
        {
          url: '/_next/static/chunks/2614-2a6709e7086ee84b.js.map',
          revision: '6e275f8ce75782b3a96e201cc789751d',
        },
        {
          url: '/_next/static/chunks/2619-31293ee93b22fec4.js',
          revision: '31293ee93b22fec4',
        },
        {
          url: '/_next/static/chunks/2619-31293ee93b22fec4.js.map',
          revision: 'dbc2e848eb315dcad8e980736231b094',
        },
        {
          url: '/_next/static/chunks/2985.65f32a0c2cd49e07.js',
          revision: '65f32a0c2cd49e07',
        },
        {
          url: '/_next/static/chunks/2985.65f32a0c2cd49e07.js.map',
          revision: 'd3d2a11a79faea720ab6e2cf3b68d852',
        },
        {
          url: '/_next/static/chunks/3094-80a4dbda5e95a68a.js',
          revision: '80a4dbda5e95a68a',
        },
        {
          url: '/_next/static/chunks/3094-80a4dbda5e95a68a.js.map',
          revision: '3b1d9638b3d618e9eba653328a8cc3e2',
        },
        {
          url: '/_next/static/chunks/30a37ab2-7ca6ffc2e31c29fe.js',
          revision: '7ca6ffc2e31c29fe',
        },
        {
          url: '/_next/static/chunks/3302-d121d0839ee57175.js',
          revision: 'd121d0839ee57175',
        },
        {
          url: '/_next/static/chunks/3302-d121d0839ee57175.js.map',
          revision: 'a1f5f880380b20186c825712fc984024',
        },
        {
          url: '/_next/static/chunks/3361.db1814d60528bcc2.js',
          revision: 'db1814d60528bcc2',
        },
        {
          url: '/_next/static/chunks/3361.db1814d60528bcc2.js.map',
          revision: '237f3fe35f09144f49374ad4558c4479',
        },
        {
          url: '/_next/static/chunks/3403-6725f174ebc3808c.js',
          revision: '6725f174ebc3808c',
        },
        {
          url: '/_next/static/chunks/3403-6725f174ebc3808c.js.map',
          revision: '451d68e22e861335d0b950f832982b20',
        },
        {
          url: '/_next/static/chunks/3824-90e816506db92bfd.js',
          revision: '90e816506db92bfd',
        },
        {
          url: '/_next/static/chunks/3824-90e816506db92bfd.js.map',
          revision: 'dd5a90efd6f1b8cf50d242d332b4a619',
        },
        {
          url: '/_next/static/chunks/4364-3d80cbe2a0c5b0ca.js',
          revision: '3d80cbe2a0c5b0ca',
        },
        {
          url: '/_next/static/chunks/4364-3d80cbe2a0c5b0ca.js.map',
          revision: 'dc3ec0b6f69dff00be68d1c54fef49a2',
        },
        {
          url: '/_next/static/chunks/4383.773c35492a4197f5.js',
          revision: '773c35492a4197f5',
        },
        {
          url: '/_next/static/chunks/4383.773c35492a4197f5.js.map',
          revision: 'a0088b681b3a8ab311212a6074daed5e',
        },
        {
          url: '/_next/static/chunks/4865-86166da06fb4131a.js',
          revision: '86166da06fb4131a',
        },
        {
          url: '/_next/static/chunks/4865-86166da06fb4131a.js.map',
          revision: '6005504aaea076a101c8aa0023c54be1',
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
          url: '/_next/static/chunks/5192-b1250efec92b430f.js',
          revision: 'b1250efec92b430f',
        },
        {
          url: '/_next/static/chunks/5192-b1250efec92b430f.js.map',
          revision: 'a7f9c0586f19eb9762fa34dec2440aab',
        },
        {
          url: '/_next/static/chunks/5239-7545fa157a030f3f.js',
          revision: '7545fa157a030f3f',
        },
        {
          url: '/_next/static/chunks/5239-7545fa157a030f3f.js.map',
          revision: '57bcbc01d119f7ccc13d2937dc85aeed',
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
          url: '/_next/static/chunks/5493-293d86a8d759a1b1.js',
          revision: '293d86a8d759a1b1',
        },
        {
          url: '/_next/static/chunks/5493-293d86a8d759a1b1.js.map',
          revision: '522d7a072f33c141cd5d9af9f12e916d',
        },
        {
          url: '/_next/static/chunks/5502-11466acbc38c5198.js',
          revision: '11466acbc38c5198',
        },
        {
          url: '/_next/static/chunks/5502-11466acbc38c5198.js.map',
          revision: 'd13586628bf92e4f1010598a6628d1ec',
        },
        {
          url: '/_next/static/chunks/5613-098d8260542e95bc.js',
          revision: '098d8260542e95bc',
        },
        {
          url: '/_next/static/chunks/5613-098d8260542e95bc.js.map',
          revision: '50d37a81abe446d6eb23069a11222086',
        },
        {
          url: '/_next/static/chunks/5707-b8643b4d7ab17f25.js',
          revision: 'b8643b4d7ab17f25',
        },
        {
          url: '/_next/static/chunks/5707-b8643b4d7ab17f25.js.map',
          revision: '10f181cca88b1ace51380b21ef79503b',
        },
        {
          url: '/_next/static/chunks/5882-ba379a263b546d16.js',
          revision: 'ba379a263b546d16',
        },
        {
          url: '/_next/static/chunks/5882-ba379a263b546d16.js.map',
          revision: 'e3c142e8492a8ebc8e7096f99109f7f6',
        },
        {
          url: '/_next/static/chunks/5947-b58b0a68085a1e10.js',
          revision: 'b58b0a68085a1e10',
        },
        {
          url: '/_next/static/chunks/5947-b58b0a68085a1e10.js.map',
          revision: '4a9f89be3650cbedad9796404bd44124',
        },
        {
          url: '/_next/static/chunks/6323-c16b1d259626b98a.js',
          revision: 'c16b1d259626b98a',
        },
        {
          url: '/_next/static/chunks/6323-c16b1d259626b98a.js.map',
          revision: 'a1394d67f19877f8865284c884ffcf16',
        },
        {
          url: '/_next/static/chunks/6527-c0d1bef286ce8e9e.js',
          revision: 'c0d1bef286ce8e9e',
        },
        {
          url: '/_next/static/chunks/6527-c0d1bef286ce8e9e.js.map',
          revision: '1d4bdac934748f90b0886bb19f59c203',
        },
        {
          url: '/_next/static/chunks/6751-39dbc3c2826bfe7c.js',
          revision: '39dbc3c2826bfe7c',
        },
        {
          url: '/_next/static/chunks/6751-39dbc3c2826bfe7c.js.map',
          revision: '2e80d9955ee9714d43f29b66ba1cd681',
        },
        {
          url: '/_next/static/chunks/6768-400201288d969a79.js',
          revision: '400201288d969a79',
        },
        {
          url: '/_next/static/chunks/6768-400201288d969a79.js.map',
          revision: '681b9de7e833ceec218126e26bbfcedf',
        },
        {
          url: '/_next/static/chunks/6843-b9461c5c8a958be7.js',
          revision: 'b9461c5c8a958be7',
        },
        {
          url: '/_next/static/chunks/6843-b9461c5c8a958be7.js.map',
          revision: 'ce14ce1903d814eed177ed21948e8a61',
        },
        {
          url: '/_next/static/chunks/7073-e092563d56f49b52.js',
          revision: 'e092563d56f49b52',
        },
        {
          url: '/_next/static/chunks/7073-e092563d56f49b52.js.map',
          revision: '5582adff06d2e8ee5aa702033f541e30',
        },
        {
          url: '/_next/static/chunks/7296-ff2487f15a135f2b.js',
          revision: 'ff2487f15a135f2b',
        },
        {
          url: '/_next/static/chunks/7296-ff2487f15a135f2b.js.map',
          revision: '96cd337eb98689746727f78a37f3110c',
        },
        {
          url: '/_next/static/chunks/7339-730c414e84ea0a57.js',
          revision: '730c414e84ea0a57',
        },
        {
          url: '/_next/static/chunks/7339-730c414e84ea0a57.js.map',
          revision: 'a95dabb896cd928552cfce413ca52b30',
        },
        {
          url: '/_next/static/chunks/7492-8167761c0b18ea4b.js',
          revision: '8167761c0b18ea4b',
        },
        {
          url: '/_next/static/chunks/7492-8167761c0b18ea4b.js.map',
          revision: 'e56c95bfc950bb8d65f000501b7deff3',
        },
        {
          url: '/_next/static/chunks/7642-eea082b9244c563a.js',
          revision: 'eea082b9244c563a',
        },
        {
          url: '/_next/static/chunks/7642-eea082b9244c563a.js.map',
          revision: '49cb751f6b719bf69ec7b4c0c691cfdb',
        },
        {
          url: '/_next/static/chunks/7668-df3c3c9f0048e7cc.js',
          revision: 'df3c3c9f0048e7cc',
        },
        {
          url: '/_next/static/chunks/7668-df3c3c9f0048e7cc.js.map',
          revision: 'b7c6792cf011eee6fd76660f9203e4f9',
        },
        {
          url: '/_next/static/chunks/7707-cad818397d3f7dc4.js',
          revision: 'cad818397d3f7dc4',
        },
        {
          url: '/_next/static/chunks/7707-cad818397d3f7dc4.js.map',
          revision: '9e3b7d2fafdec5a6e3b9be22253f4336',
        },
        {
          url: '/_next/static/chunks/7750.32180d3dddf27d5b.js',
          revision: '32180d3dddf27d5b',
        },
        {
          url: '/_next/static/chunks/7750.32180d3dddf27d5b.js.map',
          revision: '006522388bf3f5c30e2f29550ed0b7ec',
        },
        {
          url: '/_next/static/chunks/7766-d2f4defea3f47801.js',
          revision: 'd2f4defea3f47801',
        },
        {
          url: '/_next/static/chunks/7766-d2f4defea3f47801.js.map',
          revision: '51d1420f42292e42074e26cca936c3c5',
        },
        {
          url: '/_next/static/chunks/8428-fab62b4b20b4d712.js',
          revision: 'fab62b4b20b4d712',
        },
        {
          url: '/_next/static/chunks/8428-fab62b4b20b4d712.js.map',
          revision: 'cc54175aaa95b48815389cf54701da44',
        },
        {
          url: '/_next/static/chunks/8429-99b04ce5875d6c77.js',
          revision: '99b04ce5875d6c77',
        },
        {
          url: '/_next/static/chunks/8429-99b04ce5875d6c77.js.map',
          revision: 'c42f5a4e2bf62ed4b6d2e1d93cad26b9',
        },
        {
          url: '/_next/static/chunks/8720-2b670fb4d4d64ba4.js',
          revision: '2b670fb4d4d64ba4',
        },
        {
          url: '/_next/static/chunks/8720-2b670fb4d4d64ba4.js.map',
          revision: '6b3825cae8039bfc1b93507e64a4947c',
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
          url: '/_next/static/chunks/905-e8d6d9706cd5fca0.js',
          revision: 'e8d6d9706cd5fca0',
        },
        {
          url: '/_next/static/chunks/905-e8d6d9706cd5fca0.js.map',
          revision: 'e8d5d4ce079832119549c459468e47c1',
        },
        {
          url: '/_next/static/chunks/9099-b1f81efd7ba3b3e5.js',
          revision: 'b1f81efd7ba3b3e5',
        },
        {
          url: '/_next/static/chunks/9099-b1f81efd7ba3b3e5.js.map',
          revision: '1e26042925fbcf63fc7fcea0ce8b49d5',
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
          url: '/_next/static/chunks/9516-6c0472fa86096be9.js',
          revision: '6c0472fa86096be9',
        },
        {
          url: '/_next/static/chunks/9516-6c0472fa86096be9.js.map',
          revision: 'bb2d204c7c1f89df4b176afc7befd6e1',
        },
        {
          url: '/_next/static/chunks/960-d373024d17afda39.js',
          revision: 'd373024d17afda39',
        },
        {
          url: '/_next/static/chunks/960-d373024d17afda39.js.map',
          revision: '3227dd08edf0f1032ea22d54e0b779d0',
        },
        {
          url: '/_next/static/chunks/9764-0bdf56e4acb89ad5.js',
          revision: '0bdf56e4acb89ad5',
        },
        {
          url: '/_next/static/chunks/9764-0bdf56e4acb89ad5.js.map',
          revision: '31a9c5988c3bdba96e6dbec6605368e7',
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
          url: '/_next/static/chunks/app/(admin)/admin/layout-46ec45e6ce8344f6.js',
          revision: '46ec45e6ce8344f6',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-46ec45e6ce8344f6.js.map',
          revision: '7eb4c136cf102776f7c4e92d397e6a68',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/login/page-d76f5bc480b5b5f9.js',
          revision: 'd76f5bc480b5b5f9',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/login/page-d76f5bc480b5b5f9.js.map',
          revision: 'dc537a53406c390bd00533613c8852ae',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-87f8e251a6e1c9bc.js',
          revision: '87f8e251a6e1c9bc',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-87f8e251a6e1c9bc.js.map',
          revision: '0d8f7048e2a128bd10c6220296ec2d3d',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/page-8c56b4c4db929813.js',
          revision: '8c56b4c4db929813',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/ros/page-4b5ea6cec8834674.js',
          revision: '4b5ea6cec8834674',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/ros/page-4b5ea6cec8834674.js.map',
          revision: '91c51623a75bcbe8603d52a698ed3aa1',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-8bea66e2bed237d6.js',
          revision: '8bea66e2bed237d6',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-8bea66e2bed237d6.js.map',
          revision: 'c27525a8316cb50bdb1a271a9c906d7a',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/setup-2fa/page-4b4d936b8d57a8a7.js',
          revision: '4b4d936b8d57a8a7',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/setup-2fa/page-4b4d936b8d57a8a7.js.map',
          revision: '740eb6e184ebb5b1af5471c1313bc1cf',
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
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-1ba2dbab15e74b7a.js',
          revision: '1ba2dbab15e74b7a',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-1ba2dbab15e74b7a.js.map',
          revision: '06183a367f6d490c9c2cb160c82dd67e',
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
          url: '/_next/static/chunks/app/(auth)/login/page-36ee0c909d5e1693.js',
          revision: '36ee0c909d5e1693',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-36ee0c909d5e1693.js.map',
          revision: '97ef5c809c18b193cc9591ad9ef4b69a',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-789554f903de353b.js',
          revision: '789554f903de353b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-3858088f9a5f1375.js',
          revision: '3858088f9a5f1375',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-3858088f9a5f1375.js.map',
          revision: '7d09e0000815442e6f432133b7809dc9',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-bf230f50c322d444.js',
          revision: 'bf230f50c322d444',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-bf230f50c322d444.js.map',
          revision: '280cdb6114288f93274d47d7086c78ed',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-756f0c7796d842fb.js',
          revision: '756f0c7796d842fb',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-756f0c7796d842fb.js.map',
          revision: 'ce65ac34a03a1edd2e551edd70e33d50',
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
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-111ce1dad7af8f40.js',
          revision: '111ce1dad7af8f40',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-111ce1dad7af8f40.js.map',
          revision: '23b9d0f3db81d4fe0892f7ed143abb89',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-de4d08d3168f3cdc.js',
          revision: 'de4d08d3168f3cdc',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-de4d08d3168f3cdc.js.map',
          revision: '6be1a2c5955eeb90c2203bc086814704',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-7b0e38ae39912043.js',
          revision: '7b0e38ae39912043',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-7b0e38ae39912043.js.map',
          revision: 'c56387543b343816eff429f7f716f459',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-0abd6fdd18baa1b5.js',
          revision: '0abd6fdd18baa1b5',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-0abd6fdd18baa1b5.js.map',
          revision: 'a098b11eb56dedc0e441d8ec2ec904b2',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-50a7377e78060f19.js',
          revision: '50a7377e78060f19',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-50a7377e78060f19.js.map',
          revision: '4b1e14015b36d5dec880126f7405aec8',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-f4eb4cc21f3bdda9.js',
          revision: 'f4eb4cc21f3bdda9',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-f4eb4cc21f3bdda9.js.map',
          revision: 'f030ee7bae7acf626c70c346c28b6a90',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-524469095cecfeb7.js',
          revision: '524469095cecfeb7',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-524469095cecfeb7.js.map',
          revision: 'c516fc413cbf8c33ab31e3a3a5aec08b',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/trading-signals/page-389cd18d59b56e1e.js',
          revision: '389cd18d59b56e1e',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/trading-signals/page-389cd18d59b56e1e.js.map',
          revision: 'aa8c1296d0aacd4576b1c8593e23be55',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-00aec767e8d45244.js',
          revision: '00aec767e8d45244',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-00aec767e8d45244.js.map',
          revision: '235421a55f29c80c0259320e9b8ec44a',
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
          url: '/_next/static/chunks/app/debug-auth/page-75e1fc6561aa9a46.js',
          revision: '75e1fc6561aa9a46',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-75e1fc6561aa9a46.js.map',
          revision: '7458ce9314437cd32464d56dbfd3d8eb',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-c8ff4b06bfa52f90.js',
          revision: 'c8ff4b06bfa52f90',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-c8ff4b06bfa52f90.js.map',
          revision: '614970c303808b5b20d6cafd2da724a9',
        },
        {
          url: '/_next/static/chunks/app/error-098bf2ef5094746b.js',
          revision: '098bf2ef5094746b',
        },
        {
          url: '/_next/static/chunks/app/error-098bf2ef5094746b.js.map',
          revision: '24a5f7d3c02e02870962e456dbe298d4',
        },
        {
          url: '/_next/static/chunks/app/global-error-e5415ebdac43499f.js',
          revision: 'e5415ebdac43499f',
        },
        {
          url: '/_next/static/chunks/app/global-error-e5415ebdac43499f.js.map',
          revision: 'ae9893847d709bf3e17016ad34dfa980',
        },
        {
          url: '/_next/static/chunks/app/layout-15af71c263910485.js',
          revision: '15af71c263910485',
        },
        {
          url: '/_next/static/chunks/app/layout-15af71c263910485.js.map',
          revision: 'c9a0f9ce4675f54d5fad001c4c40c1ef',
        },
        {
          url: '/_next/static/chunks/app/not-found-4dc597ccd8e986e3.js',
          revision: '4dc597ccd8e986e3',
        },
        {
          url: '/_next/static/chunks/app/not-found-4dc597ccd8e986e3.js.map',
          revision: 'b7d2a7081e2b7e3d84c25c0fc00c874b',
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
          url: '/_next/static/chunks/app/sentry-test/page-f082dbf3ef6e3e2d.js',
          revision: 'f082dbf3ef6e3e2d',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-f082dbf3ef6e3e2d.js.map',
          revision: '25e1add908a5f74661257e9dcbff4ab7',
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
          url: '/_next/static/chunks/main-app-aa181369657e3379.js',
          revision: 'aa181369657e3379',
        },
        {
          url: '/_next/static/chunks/main-app-aa181369657e3379.js.map',
          revision: '9de8d35de2f1a6514d887f42e6581fe9',
        },
        {
          url: '/_next/static/chunks/main-dca3b570b9d060d8.js',
          revision: 'dca3b570b9d060d8',
        },
        {
          url: '/_next/static/chunks/main-dca3b570b9d060d8.js.map',
          revision: 'dd00dc381c6107caf34a8a61bd5a0b91',
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
          url: '/_next/static/chunks/pages/_error-cbbba11484e4dc18.js',
          revision: 'cbbba11484e4dc18',
        },
        {
          url: '/_next/static/chunks/pages/_error-cbbba11484e4dc18.js.map',
          revision: 'a159149cc7b54f1d5918573cb5e4ebcf',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-0c199e3a9f9d628f.js',
          revision: '0c199e3a9f9d628f',
        },
        {
          url: '/_next/static/chunks/webpack-0c199e3a9f9d628f.js.map',
          revision: 'f4978bebac5a422089b097810bc9b679',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css',
          revision: '041aafb0eaf4613c',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css.map',
          revision: '6c44e02f2daf8012514479984af7d2c8',
        },
        {
          url: '/_next/static/css/1975160cbc7fbda1.css',
          revision: '1975160cbc7fbda1',
        },
        {
          url: '/_next/static/css/1975160cbc7fbda1.css.map',
          revision: '8bf72b49f098f322bbb742e502f099b8',
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
        {
          url: '/_next/static/z4EU6J1Mtecz2uIxBk9_y/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
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
