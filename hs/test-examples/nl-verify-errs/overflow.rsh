'reach 0.1';

export const main = Reach.App(
  { verifyOverflow: true },
  [['A', { get: Fun([], UInt),
           put: Fun([UInt], Null) }]],
  (A) => {
    A.only(() => {
      const x = declassify(interact.get());
    });
    A.publish(x);
    const y = x + 1;
    commit();

    A.only(() => {
      interact.put(y);
    });

    exit();
  });
