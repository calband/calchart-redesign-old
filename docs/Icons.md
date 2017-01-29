Icons
=====

** Should be moved to the compcomm-info repo when other repos use Fontastic as well

This repo uses Fontastic for icons, which is saved in the cloud at `http://app.fontastic.me`. This allows the exact same icon set to be shared each year and updated if needed.

## Tutorial

To add an icon, you can first open `css/fonts/icons-reference.html` in a browser and find the name of the icon you want, like `arrow-left`. Then, in the HTML, you can do `<i class="icon-arrow-left"></i>` to add the icon. You can also add it in the CSS:

```css
span:before {
    content: "\54"; // get this from css/vendor/icons.css
    font-family: "icons";
}
```

## Update

To update the icon set, go to `http://app.fontastic.me` and add or remove any icons by clicking on them. You can also create SVGs and upload them (instructions [here](http://fontastic.me/faq)). You can customize icon names in the "Customize" tab and download them in the "Publish" tab.

Then put all the files in the appropriate places in the project. You also need to modify the following files for our project:

- Rename `styles.css` to `icons.css`
- `icons-reference.html`: Change `<link rel="stylesheet" href="styles.css">` to `<link rel="stylesheet" href="../vendor/icons.css">`.
- `icons.css`: Change all of the urls from `fonts/icons.*` to `../fonts/icons.*`.
