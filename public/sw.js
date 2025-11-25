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
    const d =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[d]) return;
    let n = {};
    const t = (e) => s(e, d),
      f = { module: { uri: d }, exports: n, require: t };
    a[d] = Promise.all(c.map((e) => f[e] || t(e))).then((e) => (i(...e), n));
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
          url: '/_next/static/AMo63tteDtUrHGk3O9KFu/_ssgManifest.js',
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
          url: '/_next/static/chunks/1555-982ce42b338c5b32.js',
          revision: '982ce42b338c5b32',
        },
        {
          url: '/_next/static/chunks/1555-982ce42b338c5b32.js.map',
          revision: '438eb87340087d52f4fa0f2f86aef7f2',
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
          url: '/_next/static/chunks/1646.45d014c16fd881b5.js',
          revision: '45d014c16fd881b5',
        },
        {
          url: '/_next/static/chunks/1646.45d014c16fd881b5.js.map',
          revision: '3c03f9503c0946355becc56155837d60',
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
          url: '/_next/static/chunks/2454-9f75d0b3fa3a1987.js',
          revision: '9f75d0b3fa3a1987',
        },
        {
          url: '/_next/static/chunks/2454-9f75d0b3fa3a1987.js.map',
          revision: 'f859e1b7974056809b1a64772521bd59',
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
          url: '/_next/static/chunks/295-b5eb64ac1b43ceab.js',
          revision: 'b5eb64ac1b43ceab',
        },
        {
          url: '/_next/static/chunks/295-b5eb64ac1b43ceab.js.map',
          revision: 'b1eb2b52605a0a4985cb4fdcb4ff4d86',
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
          url: '/_next/static/chunks/3735-fa2704afed8bec4b.js',
          revision: 'fa2704afed8bec4b',
        },
        {
          url: '/_next/static/chunks/3735-fa2704afed8bec4b.js.map',
          revision: 'b398bddff8cb8433a7963a7845073def',
        },
        {
          url: '/_next/static/chunks/4038-01bd267a2344de15.js',
          revision: '01bd267a2344de15',
        },
        {
          url: '/_next/static/chunks/4038-01bd267a2344de15.js.map',
          revision: '5130f03549eb5cafee2f9a49cac49735',
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
          url: '/_next/static/chunks/4383.773c35492a4197f5.js',
          revision: '773c35492a4197f5',
        },
        {
          url: '/_next/static/chunks/4383.773c35492a4197f5.js.map',
          revision: 'a0088b681b3a8ab311212a6074daed5e',
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
          url: '/_next/static/chunks/5217-bd7a79d786f72e86.js',
          revision: 'bd7a79d786f72e86',
        },
        {
          url: '/_next/static/chunks/5217-bd7a79d786f72e86.js.map',
          revision: 'f4e18d64dd6538db17183c72fd6e844b',
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
          url: '/_next/static/chunks/6387-0a89931d7e62a1ef.js',
          revision: '0a89931d7e62a1ef',
        },
        {
          url: '/_next/static/chunks/6387-0a89931d7e62a1ef.js.map',
          revision: '8727da0c1560e541a93132fcf2823a70',
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
          url: '/_next/static/chunks/7729-1baefaf109b1eb76.js',
          revision: '1baefaf109b1eb76',
        },
        {
          url: '/_next/static/chunks/7729-1baefaf109b1eb76.js.map',
          revision: 'cfd38050eddd40c5e7484f615a7fb13d',
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
          url: '/_next/static/chunks/8156-d11ba013c460743a.js',
          revision: 'd11ba013c460743a',
        },
        {
          url: '/_next/static/chunks/8156-d11ba013c460743a.js.map',
          revision: '73c989f0a5bda255e2c7d442b3094a1d',
        },
        {
          url: '/_next/static/chunks/8239-4c0e85153b8db4da.js',
          revision: '4c0e85153b8db4da',
        },
        {
          url: '/_next/static/chunks/8239-4c0e85153b8db4da.js.map',
          revision: '7150bf1c912dd130de87a64b1128fc1b',
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
          url: '/_next/static/chunks/905-e8d6d9706cd5fca0.js',
          revision: 'e8d6d9706cd5fca0',
        },
        {
          url: '/_next/static/chunks/905-e8d6d9706cd5fca0.js.map',
          revision: 'e8d5d4ce079832119549c459468e47c1',
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
          url: '/_next/static/chunks/9764-8bdd987b3619d301.js',
          revision: '8bdd987b3619d301',
        },
        {
          url: '/_next/static/chunks/9764-8bdd987b3619d301.js.map',
          revision: '28d382591a99f49ebe92721b52e8a39d',
        },
        {
          url: '/_next/static/chunks/9881-799c11cac6ad5ff9.js',
          revision: '799c11cac6ad5ff9',
        },
        {
          url: '/_next/static/chunks/9881-799c11cac6ad5ff9.js.map',
          revision: '720aeffaea3c3600a3819addd09747ff',
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
          url: '/_next/static/chunks/app/(admin)/admin/layout-25faf70a15cd9aae.js',
          revision: '25faf70a15cd9aae',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-25faf70a15cd9aae.js.map',
          revision: 'f21957f21386d58193636a1b40ab0bf6',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-aee7dbe0735a1c0d.js',
          revision: 'aee7dbe0735a1c0d',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-aee7dbe0735a1c0d.js.map',
          revision: '3bc8df46518d6cf75cad3464912f989a',
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
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-f2e0e126765e5bca.js',
          revision: 'f2e0e126765e5bca',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-f2e0e126765e5bca.js.map',
          revision: '04c723107696ee664f4bb54bd7d5a59f',
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
          url: '/_next/static/chunks/app/(auth)/login/page-48a9307ef9dc54cb.js',
          revision: '48a9307ef9dc54cb',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-48a9307ef9dc54cb.js.map',
          revision: '263e74785acde0896a24037966543210',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-789554f903de353b.js',
          revision: '789554f903de353b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-33c27a58fa465cce.js',
          revision: '33c27a58fa465cce',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-33c27a58fa465cce.js.map',
          revision: '73bb1e799712fbfc812b1715962afec5',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-a339b7d2c31ae4c8.js',
          revision: 'a339b7d2c31ae4c8',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-a339b7d2c31ae4c8.js.map',
          revision: '7b477c01b606431915da2beea038e202',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-3e9106c7523ee4c1.js',
          revision: '3e9106c7523ee4c1',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-3e9106c7523ee4c1.js.map',
          revision: 'f2127486298c3497decc753e3e41bbe0',
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
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-066d1c1e1452e3ac.js',
          revision: '066d1c1e1452e3ac',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-066d1c1e1452e3ac.js.map',
          revision: '75a04720e2cc95b8100b39e05704aad1',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-e59d1c001053ece4.js',
          revision: 'e59d1c001053ece4',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-e59d1c001053ece4.js.map',
          revision: '69338fa3e5dd83075b4e5b5f46c75df4',
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
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-d173054fb048000d.js',
          revision: 'd173054fb048000d',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-d173054fb048000d.js.map',
          revision: '8b27d1de9a738ccf7b701e45a2f56123',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-4cf65fc86a609cce.js',
          revision: '4cf65fc86a609cce',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-4cf65fc86a609cce.js.map',
          revision: '43789fd100d223443d784e8f7be947e6',
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
          url: '/_next/static/chunks/app/(dashboard)/dashboard/transactions/page-ad35cade3a69ee84.js',
          revision: 'ad35cade3a69ee84',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/transactions/page-ad35cade3a69ee84.js.map',
          revision: 'b4505b4a759d62836a93f8cfc61bf197',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-5d9243a48835c67a.js',
          revision: '5d9243a48835c67a',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-5d9243a48835c67a.js.map',
          revision: 'c13dbc0ba1f1029c529f1f77f34d6aad',
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
          url: '/_next/static/chunks/app/debug-auth/page-07df31f9eec1520b.js',
          revision: '07df31f9eec1520b',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-07df31f9eec1520b.js.map',
          revision: '7e66752636301c674a934caacd85d4a6',
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
          url: '/_next/static/chunks/app/error-cd0bd1e0e724c9ec.js',
          revision: 'cd0bd1e0e724c9ec',
        },
        {
          url: '/_next/static/chunks/app/error-cd0bd1e0e724c9ec.js.map',
          revision: 'b4ac74dbd8c4d01c8f7fde3bc021acff',
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
          url: '/_next/static/chunks/app/layout-069d82c8298a027a.js',
          revision: '069d82c8298a027a',
        },
        {
          url: '/_next/static/chunks/app/layout-069d82c8298a027a.js.map',
          revision: '38e8da4333fd6ea557b8302dfd64050a',
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
          url: '/_next/static/chunks/app/page-0a986fb27a030a78.js',
          revision: '0a986fb27a030a78',
        },
        {
          url: '/_next/static/chunks/app/page-0a986fb27a030a78.js.map',
          revision: '2fb2b0ae7df309fb29f8e2e79755a2d4',
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
          url: '/_next/static/chunks/main-32260c47fbed1ea2.js',
          revision: '32260c47fbed1ea2',
        },
        {
          url: '/_next/static/chunks/main-32260c47fbed1ea2.js.map',
          revision: '341b6e7e36525883a29245a962d43808',
        },
        {
          url: '/_next/static/chunks/main-app-8fb7491699ab8184.js',
          revision: '8fb7491699ab8184',
        },
        {
          url: '/_next/static/chunks/main-app-8fb7491699ab8184.js.map',
          revision: '3b5a9a6afe54670597563fb31e998999',
        },
        {
          url: '/_next/static/chunks/pages/_app-8f77d26e31ca2da0.js',
          revision: '8f77d26e31ca2da0',
        },
        {
          url: '/_next/static/chunks/pages/_app-8f77d26e31ca2da0.js.map',
          revision: '13b54d9516dc1bc93e45ab2177a05d5f',
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
          url: '/_next/static/chunks/webpack-19c18ea9cf9f8987.js',
          revision: '19c18ea9cf9f8987',
        },
        {
          url: '/_next/static/chunks/webpack-19c18ea9cf9f8987.js.map',
          revision: 'ba5abe8ae8bba15b5b08175e4b085c3f',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css',
          revision: '041aafb0eaf4613c',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css.map',
          revision: 'c569af62951957a6e660c58efe484990',
        },
        {
          url: '/_next/static/css/84fb1640c463fd4c.css',
          revision: '84fb1640c463fd4c',
        },
        {
          url: '/_next/static/css/84fb1640c463fd4c.css.map',
          revision: 'ba84bc425487ddcf8485c87a477707df',
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
