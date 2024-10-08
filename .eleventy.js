const pluginBookshop = require("@bookshop/eleventy-bookshop");
const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const yaml = require("js-yaml");
const svgContents = require("eleventy-plugin-svg-contents");
const esbuild = require('esbuild');


/* 11ty config imports */
const image_shortcode = require('./_11ty_config/image_shortcode')
const military_time = require('./_11ty_config/military_time_filter')
const assign_local_liquid_tag = require('./_11ty_config/assign_local_liquid_tag')
const contains_block_filter = require('./_11ty_config/contains_block_filter')





module.exports = function (eleventyConfig) {
  // Hot reloading for local dev
  eleventyConfig.setBrowserSyncConfig({
		files: './_site/**/*.*'
	});

  // Add markdownify filter
  eleventyConfig.addFilter("markdownify", (content) => {
    const md = new markdownIt({
      html: true,
      breaks: true,
      linkify: true,
    });
    return md.render(content);
  });




  // Display the current year
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Find the length of an array
  eleventyConfig.addFilter("length", (input) => {
    return input.length;
  });

  // Using Luxon for date formatting
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  // What gets passed through to the built site
  eleventyConfig.ignores.add("src/schemas");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/assets/uploads");



  // Data extensions
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));

  // Custom shortcodes
  eleventyConfig.addShortcode("image", image_shortcode);
  
  eleventyConfig.addWatchTarget("component-library/");



  // Bookshop integration
  eleventyConfig.addPlugin(svgContents);
  eleventyConfig.addPlugin(pluginBookshop({
    bookshopLocations: ["component-library"],  
    pathPrefix: '', 
  }));

  // Filters
  eleventyConfig.addFilter("markdownify", (markdown) => md.render(markdown));
  eleventyConfig.addFilter("ymlify", (yml) => yaml.load(yml));
  eleventyConfig.addFilter("militaryTime", military_time);
  eleventyConfig.addFilter('contains_block', contains_block_filter);

  // Tags
   eleventyConfig.addLiquidTag('assign_local', assign_local_liquid_tag);

  // esbuild
  eleventyConfig.addWatchTarget('./src/assets/js/**');
  eleventyConfig.on('eleventy.before', async () => {
    await esbuild.build({
      entryPoints: ['src/assets/js/**'],
      outdir: '_site/assets/js',
      bundle: true,
      minify: true,
      sourcemap: true,
    });
  });


  return {
    dir: {
      input: "src",
      pages: "pages",
    },
  };
};