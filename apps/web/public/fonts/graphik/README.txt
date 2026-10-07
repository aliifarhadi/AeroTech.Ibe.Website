Graphik Web is the primary Latin typeface for non-Persian locales (en, de, …).

It is a LICENSED font (Commercial Type) and is not bundled with this repo. Add your licensed
web font files here so the @font-face rules in src/app/globals.css resolve:

  Graphik-Regular.woff2    (weight 400)
  Graphik-Medium.woff2     (weight 500)
  Graphik-Semibold.woff2   (weight 600)
  Graphik-Bold.woff2       (weight 700)

Until these files are added, Latin text falls back to Alibaba (then system fonts).
Persian and Arabic always render in Alibaba regardless (Graphik has no Arabic glyphs).
