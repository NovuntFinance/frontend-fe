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
          url: '/_next/static/PDgTVij2YunAt7FKCHT9z/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/1314-7ed2977e01c15272.js',
          revision: '7ed2977e01c15272',
        },
        {
          url: '/_next/static/chunks/1314-7ed2977e01c15272.js.map',
          revision: '4f3197e271fe0aaf6953655f444b931a',
        },
        {
          url: '/_next/static/chunks/1555-982ce42b338c5b32.js',
          revision: '982ce42b338c5b32',
        },
        {
          url: '/_next/static/chunks/1555-982ce42b338c5b32.js.map',
          revision: '438eb87340087d52f4fa0f2f86aef7f2',
        },
        {
          url: '/_next/static/chunks/1603-e6cecf0388bbd3a1.js',
          revision: 'e6cecf0388bbd3a1',
        },
        {
          url: '/_next/static/chunks/1603-e6cecf0388bbd3a1.js.map',
          revision: 'ecb9d80b5639c7ca51b7961179e3d035',
        },
        {
          url: '/_next/static/chunks/1646.3d59cb7c91b0024c.js',
          revision: '3d59cb7c91b0024c',
        },
        {
          url: '/_next/static/chunks/1646.3d59cb7c91b0024c.js.map',
          revision: 'b7735fcfc9ba608239810014bbb5b319',
        },
        {
          url: '/_next/static/chunks/2098-f7da86804b49a6be.js',
          revision: 'f7da86804b49a6be',
        },
        {
          url: '/_next/static/chunks/2098-f7da86804b49a6be.js.map',
          revision: 'c5b95c82e79ac091f57b5ff6f653d4ac',
        },
        {
          url: '/_next/static/chunks/2192-d6584d28c4df458e.js',
          revision: 'd6584d28c4df458e',
        },
        {
          url: '/_next/static/chunks/2192-d6584d28c4df458e.js.map',
          revision: 'e49336315cf505b195280e547c7ca9b6',
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
          url: '/_next/static/chunks/2619-3af705bee728abf3.js',
          revision: '3af705bee728abf3',
        },
        {
          url: '/_next/static/chunks/2619-3af705bee728abf3.js.map',
          revision: '5e7f0f5d2cd84784b2eefc24327823c8',
        },
        {
          url: '/_next/static/chunks/2807-f99e12148735f8e0.js',
          revision: 'f99e12148735f8e0',
        },
        {
          url: '/_next/static/chunks/2807-f99e12148735f8e0.js.map',
          revision: '0214b987e61f0dd4868dba41541d5e8c',
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
          url: '/_next/static/chunks/3361.879e564bd6e3942b.js',
          revision: '879e564bd6e3942b',
        },
        {
          url: '/_next/static/chunks/3361.879e564bd6e3942b.js.map',
          revision: 'fac10b7b0ce33e56e13931457d69f91b',
        },
        {
          url: '/_next/static/chunks/3588-8363f930b36c67e3.js',
          revision: '8363f930b36c67e3',
        },
        {
          url: '/_next/static/chunks/3588-8363f930b36c67e3.js.map',
          revision: '64e438b9919dcfce983e4f5d5a05639b',
        },
        {
          url: '/_next/static/chunks/3735-fa2704afed8bec4b.js',
          revision: 'fa2704afed8bec4b',
        },
        {
          url: '/_next/static/chunks/3735-fa2704afed8bec4b.js.map',
          revision: 'b398bddff8cb8433a7963a7845073def',
        },
        {
          url: '/_next/static/chunks/4038-094863c1a304b765.js',
          revision: '094863c1a304b765',
        },
        {
          url: '/_next/static/chunks/4038-094863c1a304b765.js.map',
          revision: 'c787a73d864e06cce88da33bb75146e2',
        },
        {
          url: '/_next/static/chunks/422-01ad66d72593f641.js',
          revision: '01ad66d72593f641',
        },
        {
          url: '/_next/static/chunks/422-01ad66d72593f641.js.map',
          revision: '1086f21b3cd0b61bd6488258d435cbd2',
        },
        {
          url: '/_next/static/chunks/4472-aba25f37e942de2e.js',
          revision: 'aba25f37e942de2e',
        },
        {
          url: '/_next/static/chunks/4472-aba25f37e942de2e.js.map',
          revision: 'd6e89451987dc74b9a25b128842621c5',
        },
        {
          url: '/_next/static/chunks/4729-699ecb54689e7955.js',
          revision: '699ecb54689e7955',
        },
        {
          url: '/_next/static/chunks/4729-699ecb54689e7955.js.map',
          revision: 'efbaa0dffebeedd3d8ee7a3bd976cd3b',
        },
        {
          url: '/_next/static/chunks/4883-36e117fd336cb1a1.js',
          revision: '36e117fd336cb1a1',
        },
        {
          url: '/_next/static/chunks/4883-36e117fd336cb1a1.js.map',
          revision: 'b41c80d0146bf12073a643dc3bea9836',
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
          url: '/_next/static/chunks/5139.9b51aa74315792bf.js',
          revision: '9b51aa74315792bf',
        },
        {
          url: '/_next/static/chunks/5139.9b51aa74315792bf.js.map',
          revision: '98701ce3154ea0f0f33654f5419dd185',
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
          url: '/_next/static/chunks/5217-bd7a79d786f72e86.js',
          revision: 'bd7a79d786f72e86',
        },
        {
          url: '/_next/static/chunks/5217-bd7a79d786f72e86.js.map',
          revision: 'f4e18d64dd6538db17183c72fd6e844b',
        },
        {
          url: '/_next/static/chunks/5239-c01f70ad623a545e.js',
          revision: 'c01f70ad623a545e',
        },
        {
          url: '/_next/static/chunks/5239-c01f70ad623a545e.js.map',
          revision: 'd42ec769bba52d096c490b3c4ae09f2c',
        },
        {
          url: '/_next/static/chunks/52774a7f-10d3682eacf6ebaa.js',
          revision: '10d3682eacf6ebaa',
        },
        {
          url: '/_next/static/chunks/52774a7f-10d3682eacf6ebaa.js.map',
          revision: '472d4421af923d1a438bf7d00be5d273',
        },
        {
          url: '/_next/static/chunks/568-8825ce1c34435566.js',
          revision: '8825ce1c34435566',
        },
        {
          url: '/_next/static/chunks/568-8825ce1c34435566.js.map',
          revision: 'f2558059a45adef281c92ddde43b5608',
        },
        {
          url: '/_next/static/chunks/5833-ff2d080b40de050a.js',
          revision: 'ff2d080b40de050a',
        },
        {
          url: '/_next/static/chunks/5833-ff2d080b40de050a.js.map',
          revision: '64f9889259448fb7a4f740e86dbc1f8c',
        },
        {
          url: '/_next/static/chunks/5849-1176edc63073d36d.js',
          revision: '1176edc63073d36d',
        },
        {
          url: '/_next/static/chunks/5849-1176edc63073d36d.js.map',
          revision: 'e90d69891a64b8911d5723b8d80c14af',
        },
        {
          url: '/_next/static/chunks/596-f5ec86129db6b2aa.js',
          revision: 'f5ec86129db6b2aa',
        },
        {
          url: '/_next/static/chunks/596-f5ec86129db6b2aa.js.map',
          revision: 'ab86f32395902c9b47bceeb88ca328d8',
        },
        {
          url: '/_next/static/chunks/6180-ee59a9488adb5c39.js',
          revision: 'ee59a9488adb5c39',
        },
        {
          url: '/_next/static/chunks/6180-ee59a9488adb5c39.js.map',
          revision: '85f2637e503fb8be6e04dc6f5b4c5067',
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
          url: '/_next/static/chunks/6736-9bd7f48ea407e147.js',
          revision: '9bd7f48ea407e147',
        },
        {
          url: '/_next/static/chunks/6736-9bd7f48ea407e147.js.map',
          revision: '6c9790be6d605bad3d5748c84cd6f69a',
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
          url: '/_next/static/chunks/7729-4d8e15c49ce60e0b.js',
          revision: '4d8e15c49ce60e0b',
        },
        {
          url: '/_next/static/chunks/7729-4d8e15c49ce60e0b.js.map',
          revision: '8ba8e0aa9d5c964a5887e9f6b0f18f8f',
        },
        {
          url: '/_next/static/chunks/830-732c7bacb1f07514.js',
          revision: '732c7bacb1f07514',
        },
        {
          url: '/_next/static/chunks/830-732c7bacb1f07514.js.map',
          revision: '27b7348392b93aec8e0c84bb4df9ca4a',
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
          url: '/_next/static/chunks/8749-730d7e6888280d07.js',
          revision: '730d7e6888280d07',
        },
        {
          url: '/_next/static/chunks/8749-730d7e6888280d07.js.map',
          revision: '4bd9a7cb0b3e495c6dd00fdd8ed4f4f3',
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
          url: '/_next/static/chunks/9002-1b57f10b94b8a621.js',
          revision: '1b57f10b94b8a621',
        },
        {
          url: '/_next/static/chunks/9002-1b57f10b94b8a621.js.map',
          revision: '028948f77853f566a8b204c6ae1c9830',
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
          url: '/_next/static/chunks/9193-33920b49786f0220.js',
          revision: '33920b49786f0220',
        },
        {
          url: '/_next/static/chunks/9193-33920b49786f0220.js.map',
          revision: '9d477b2f9413bcc7a8d37295655a4ce9',
        },
        {
          url: '/_next/static/chunks/9237.133b4199c67f315c.js',
          revision: '133b4199c67f315c',
        },
        {
          url: '/_next/static/chunks/9237.133b4199c67f315c.js.map',
          revision: '5389e387c045908b399a6d2557599195',
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
          url: '/_next/static/chunks/9486-35b8196c40900736.js',
          revision: '35b8196c40900736',
        },
        {
          url: '/_next/static/chunks/9486-35b8196c40900736.js.map',
          revision: '5f01935785c76853f805f1b93184dc46',
        },
        {
          url: '/_next/static/chunks/960-77cd1199dd1301f3.js',
          revision: '77cd1199dd1301f3',
        },
        {
          url: '/_next/static/chunks/960-77cd1199dd1301f3.js.map',
          revision: '7b5ea1fc4b9ed1eadc3576184ae07079',
        },
        {
          url: '/_next/static/chunks/9764-11563925d967c5d9.js',
          revision: '11563925d967c5d9',
        },
        {
          url: '/_next/static/chunks/9764-11563925d967c5d9.js.map',
          revision: 'c8d355586a446902e9df493fe883b3a6',
        },
        {
          url: '/_next/static/chunks/9881-bf01c3cab39143c9.js',
          revision: 'bf01c3cab39143c9',
        },
        {
          url: '/_next/static/chunks/9881-bf01c3cab39143c9.js.map',
          revision: '249799a3854924c31020fe7f7ec5db49',
        },
        {
          url: '/_next/static/chunks/9888-3d8ff35e95fc8b4a.js',
          revision: '3d8ff35e95fc8b4a',
        },
        {
          url: '/_next/static/chunks/9888-3d8ff35e95fc8b4a.js.map',
          revision: 'dc307b1c41b9e85eaf1f211f1a317607',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-b89486757f508d96.js',
          revision: 'b89486757f508d96',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-b89486757f508d96.js.map',
          revision: '3bd100127c770707787b5a36d74a5be0',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-88b9889db3ec346a.js',
          revision: '88b9889db3ec346a',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-88b9889db3ec346a.js.map',
          revision: '326a268f6fd20ad98de3d84c181bc60e',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-60de2a1b11a05c2e.js',
          revision: '60de2a1b11a05c2e',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-60de2a1b11a05c2e.js.map',
          revision: '945540fd9c8300993079c0c40a9014dc',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-683559d68b3f8413.js',
          revision: '683559d68b3f8413',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-683559d68b3f8413.js.map',
          revision: '8ab6e96b54a4174a990afa50b017ff15',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/page-8c56b4c4db929813.js',
          revision: '8c56b4c4db929813',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-eb90962bb4838fa7.js',
          revision: 'eb90962bb4838fa7',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-eb90962bb4838fa7.js.map',
          revision: '877b4f804265c684e9750afca6d2ba58',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-e5f417354af82831.js',
          revision: 'e5f417354af82831',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-e5f417354af82831.js.map',
          revision: '36eeeb4f928d9875eb79a04bc8230b34',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-a7e920315af98031.js',
          revision: 'a7e920315af98031',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-a7e920315af98031.js.map',
          revision: '421373d1fed71fe25e8146ae0c8dde7e',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-4869a752f3c01b2e.js',
          revision: '4869a752f3c01b2e',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-4869a752f3c01b2e.js.map',
          revision: 'd9cb76273e402066ce78634dd58dfc38',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-2712bd1e507edba8.js',
          revision: '2712bd1e507edba8',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-2712bd1e507edba8.js.map',
          revision: 'b128407a28f7bb34620d970ec4b4d313',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-9054d6655cfb5982.js',
          revision: '9054d6655cfb5982',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-9054d6655cfb5982.js.map',
          revision: '3c88d81cd2e1c37a6c91cdb19e2c3263',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-789554f903de353b.js',
          revision: '789554f903de353b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-71ba2e7a71b1523e.js',
          revision: '71ba2e7a71b1523e',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-71ba2e7a71b1523e.js.map',
          revision: '632f4e562520c35f4422bec48347b423',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-cc26eaccc98a6248.js',
          revision: 'cc26eaccc98a6248',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-cc26eaccc98a6248.js.map',
          revision: '6577aa74319ef281b26073c5511e12f3',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-f32a423a0b78d15b.js',
          revision: 'f32a423a0b78d15b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-f32a423a0b78d15b.js.map',
          revision: '8c21d7f32cbd8031b179a7e6a82fe33e',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/bonuses/page-64bf92a4da7b048c.js',
          revision: '64bf92a4da7b048c',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/bonuses/page-64bf92a4da7b048c.js.map',
          revision: '48b4c87e07abd7d419ebce326852929b',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-93caf0f57e12490c.js',
          revision: '93caf0f57e12490c',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-93caf0f57e12490c.js.map',
          revision: '8585a546cdbaaa8bdbff3d31a50e5b1c',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-0a019ed10430c171.js',
          revision: '0a019ed10430c171',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-0a019ed10430c171.js.map',
          revision: '58f22d40dd0b3e36787fb8a08a9d1b6e',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-f2e6fd099742de06.js',
          revision: 'f2e6fd099742de06',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-f2e6fd099742de06.js.map',
          revision: '24215852a6a337ea2c45704dfef27d5e',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-e0100beffd7c5abb.js',
          revision: 'e0100beffd7c5abb',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-e0100beffd7c5abb.js.map',
          revision: 'f889c623f5be8c886793e1844b7af668',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-0a56075655fe0e59.js',
          revision: '0a56075655fe0e59',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-0a56075655fe0e59.js.map',
          revision: '8b1c8bd8a07f4564c339cb2559e6f0f5',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-0e0afe1ed46390d8.js',
          revision: '0e0afe1ed46390d8',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-0e0afe1ed46390d8.js.map',
          revision: '16ce37ea8f5d472756c497f3ee4884a2',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-92ee27660d7396e8.js',
          revision: '92ee27660d7396e8',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-92ee27660d7396e8.js.map',
          revision: '11d56aaf88456b095bebec90541cf385',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-371c13c94d60e2bd.js',
          revision: '371c13c94d60e2bd',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-371c13c94d60e2bd.js.map',
          revision: '78d14d488d26a14515efa4185b2a6c24',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/transactions/page-68c350d6d2113d91.js',
          revision: '68c350d6d2113d91',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/transactions/page-68c350d6d2113d91.js.map',
          revision: '7ba1fe5d71a40b2d165336c47e6ee00e',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-8077ca49462acb09.js',
          revision: '8077ca49462acb09',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-8077ca49462acb09.js.map',
          revision: '4f686d5040ca870596d2e13e7eedbfa5',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-729fbcac3d5207bc.js',
          revision: '729fbcac3d5207bc',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-729fbcac3d5207bc.js.map',
          revision: '278c3664b87ecb07d68be630d94961b0',
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
          url: '/_next/static/chunks/app/debug-auth/page-ad9a2fe41b8f2a88.js',
          revision: 'ad9a2fe41b8f2a88',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-ad9a2fe41b8f2a88.js.map',
          revision: '422ee8dde5d8adec0327e660cb507463',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-d713adf106b1df3d.js',
          revision: 'd713adf106b1df3d',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-d713adf106b1df3d.js.map',
          revision: '5272831c4c81aa0863ccd3f57d608eda',
        },
        {
          url: '/_next/static/chunks/app/error-2789f3a7fc7456c7.js',
          revision: '2789f3a7fc7456c7',
        },
        {
          url: '/_next/static/chunks/app/error-2789f3a7fc7456c7.js.map',
          revision: 'fbc10d162debfde233449c575ac6e769',
        },
        {
          url: '/_next/static/chunks/app/global-error-ee51b7d09a1fe3fd.js',
          revision: 'ee51b7d09a1fe3fd',
        },
        {
          url: '/_next/static/chunks/app/global-error-ee51b7d09a1fe3fd.js.map',
          revision: '0c2a41e021e7e3c4d93a1d8493ea5a38',
        },
        {
          url: '/_next/static/chunks/app/layout-86f80f03c58de92c.js',
          revision: '86f80f03c58de92c',
        },
        {
          url: '/_next/static/chunks/app/layout-86f80f03c58de92c.js.map',
          revision: '556777b6f8db4e8acb7293059a44dec2',
        },
        {
          url: '/_next/static/chunks/app/not-found-b5419be764de62c6.js',
          revision: 'b5419be764de62c6',
        },
        {
          url: '/_next/static/chunks/app/not-found-b5419be764de62c6.js.map',
          revision: '5bf9ea8b36319df9e320254aad7340b1',
        },
        {
          url: '/_next/static/chunks/app/page-4657c1bb1343a423.js',
          revision: '4657c1bb1343a423',
        },
        {
          url: '/_next/static/chunks/app/page-4657c1bb1343a423.js.map',
          revision: '14080b088920f3563486697bffbf65bc',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-8813c741165f7cd4.js',
          revision: '8813c741165f7cd4',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-8813c741165f7cd4.js.map',
          revision: '3d3436b9cece794fb043b4b4eea3f2fc',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-c17379515b78cd13.js',
          revision: 'c17379515b78cd13',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-c17379515b78cd13.js.map',
          revision: 'd31c45f5d2c2f0fab1335023ea1fb71f',
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
          url: '/_next/static/chunks/main-10382e961d4d6015.js',
          revision: '10382e961d4d6015',
        },
        {
          url: '/_next/static/chunks/main-10382e961d4d6015.js.map',
          revision: '32bef458ed32b9dfb602b730cb20e6b2',
        },
        {
          url: '/_next/static/chunks/main-app-8ff2d285b44a5cb9.js',
          revision: '8ff2d285b44a5cb9',
        },
        {
          url: '/_next/static/chunks/main-app-8ff2d285b44a5cb9.js.map',
          revision: '74e6183ac5bef8a9a0e8db7373c00e83',
        },
        {
          url: '/_next/static/chunks/pages/_app-7a7ce0332845bf35.js',
          revision: '7a7ce0332845bf35',
        },
        {
          url: '/_next/static/chunks/pages/_app-7a7ce0332845bf35.js.map',
          revision: '1744805dce822d9b4ecf4d0ea7b3e6f8',
        },
        {
          url: '/_next/static/chunks/pages/_error-93a0b3277fc2b3bf.js',
          revision: '93a0b3277fc2b3bf',
        },
        {
          url: '/_next/static/chunks/pages/_error-93a0b3277fc2b3bf.js.map',
          revision: '077796195d59fad9ff01194df3e33c9c',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-49fd65e088b208be.js',
          revision: '49fd65e088b208be',
        },
        {
          url: '/_next/static/chunks/webpack-49fd65e088b208be.js.map',
          revision: 'a145389465f0a13c0122f03c73608a5c',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css',
          revision: '041aafb0eaf4613c',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css.map',
          revision: '97c8ab131502c4865a28c5f10339c76e',
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
          url: '/_next/static/css/eca6a99aba618f94.css',
          revision: 'eca6a99aba618f94',
        },
        {
          url: '/_next/static/css/eca6a99aba618f94.css.map',
          revision: 'f0ef41175b959e4cb15b80bf2e1535e0',
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
