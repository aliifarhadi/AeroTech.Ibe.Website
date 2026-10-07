DotAir uses the Alibaba font family (alibaba.ir) for both Latin and Persian.

Place the web font files here so the @font-face rules in src/app/globals.css resolve:

  Alibaba-Light.woff2     (weight 300)
  Alibaba-Regular.woff2   (weight 400)
  Alibaba-Bold.woff2      (weight 700)
  Alibaba-Black.woff2     (weight 900)

Until these files are added, the app falls back to Vazirmatn / Tahoma / system fonts,
which render Persian acceptably. Once added, no code change is needed.
