'reach 0.1';

export const main = Reach.App(
  {}, [], () => { return 0; }
);

// Exporting an ident that isn't bound
export {x};
