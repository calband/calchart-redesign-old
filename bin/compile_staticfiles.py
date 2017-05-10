import sass

sass.compile(
    dirname=('calchart/static/sass', 'calchart/static/css'),
    output_style='compressed',
)
