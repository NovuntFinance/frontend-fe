(async () => {
  try {
    const ts = Date.now();
    const email = `testnode_${ts}@example.com`;
    const username = `testnode_${ts}`;

    const resp = await fetch(
      'http://localhost:3000/api/proxy/better-auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: 'Test@123456',
          confirmPassword: 'Test@123456',
          firstName: 'Node',
          lastName: 'Tester',
          username,
        }),
      }
    );

    const text = await resp.text();
    console.log('STATUS', resp.status);
    try {
      console.log('BODY', JSON.parse(text));
    } catch {
      console.log('BODY (raw)', text);
    }
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
  }
})();
