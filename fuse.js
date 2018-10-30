const { FuseBox, ConsolidatePlugin, WebIndexPlugin, QuantumPlugin, SassPlugin, CSSPlugin, Sparky } = require('fuse-box'); // eslint-disable-line import/no-extraneous-dependencies

let fuse;
let app;
let isProduction = false;
let isStaging = false;

Sparky.task('config', () => {
  fuse = FuseBox.init({
    homeDir: 'app',
    target: 'browser@es5',
    output: 'dist/$name-$hash.js',
    hash: isProduction,
    sourceMaps: !isProduction,
    useTypescriptCompiler: true,
    plugins: [
      ConsolidatePlugin({ engine: 'pug', useDefault: false }),
      [SassPlugin({ importer: true }), CSSPlugin()],
      (isProduction || isStaging) && QuantumPlugin({
        bakeApiIntoBundle: 'app',
        uglify: true,
        css: { clean: true },
      }),
      WebIndexPlugin({ template: 'app/index.html' }),
    ],
  });

  app = fuse
    .bundle('app')
    .instructions(' > application.js');

  if (!isProduction) {
    fuse.dev({ fallback: 'index.html' });
  }
});

Sparky.task('clean', () => Sparky.src('dist/').clean('dist/'));

Sparky.task('copy-assets', () => Sparky.src('**/**.*', { base: './app/assets' }).dest('./dist'));

Sparky.task('set-production', () => {
  isProduction = true;
});

Sparky.task('set-staging', () => {
  isStaging = true;
});

// development task "node fuse""
Sparky.task('default', ['clean', 'copy-assets', 'config'], () => {
  app.hmr({ reload: true }).watch();
  return fuse.run();
});

// Dist task "node fuse dist"
Sparky.task('build', ['clean', 'copy-assets', 'set-production', 'config'], () => {
  fuse.run();
});

// Dist task "node fuse dist"
Sparky.task('dist', ['clean', 'copy-assets', 'set-staging', 'config'], () => {
  app.hmr({ reload: true }).watch();
  fuse.run();
});
