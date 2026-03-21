/* ============================================================
   Swiftora Demo — Smart Template Engine
   Keyword-matched templates. No API call required.
   Each template uses the user's exact input words
   for realistic, specific-feeling output.
============================================================ */

(function () {
  'use strict';

  // ---- Helpers ----

  function toTitleCase(str) {
    return str
      .toLowerCase()
      .replace(/\b(\w)/g, function (c) { return c.toUpperCase(); });
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Trim input, title-case it, cap at 60 chars for use in titles
  function itemLabel(raw) {
    var cleaned = raw.trim().replace(/\s+/g, ' ');
    if (cleaned.length > 60) cleaned = cleaned.slice(0, 57) + '…';
    return toTitleCase(cleaned);
  }


  // ---- Template Definitions ----

  var TEMPLATES = {

    GLASSWARE: {
      category: 'Vintage Glass & Ceramics',
      title: function (input) {
        return 'Vintage ' + itemLabel(input) + ' — Collectible, Estate Find';
      },
      description: function (input) {
        var label = itemLabel(input);
        return (
          label + ' in excellent vintage condition with the character and patina that serious collectors look for. ' +
          'Handcrafted details show the quality of production methods no longer used today — a true piece of American glass history. ' +
          'Ready to display, gift, or add to your collection; ships carefully wrapped to arrive exactly as pictured.'
        );
      },
      price: function (input) {
        var lo = rand(25, 55);
        // boost price slightly for known premium makers
        if (/fenton|blenko|anchor hocking|depression|carnival/i.test(input)) lo = rand(38, 72);
        return { low: lo, high: lo + rand(12, 28) };
      },
      rationale: 'Based on recent eBay sold comps for comparable vintage glassware in similar condition.',
      condition: 'No chips, cracks, or repairs visible. Minor surface wear consistent with careful use and age. Displays beautifully.',
      tags: ['vintage glass', 'collectible glassware', 'estate sale find', 'mid century modern', 'retro decor', 'antique glass', 'home decor', 'shelf display']
    },

    TRADING_CARDS: {
      category: 'Trading Cards & Collectibles',
      title: function (input) {
        return itemLabel(input) + ' — Collectible Card, See Scans';
      },
      description: function (input) {
        var label = itemLabel(input);
        return (
          label + ' from a smoke-free collection, stored in sleeves since acquisition. ' +
          'Card shows strong colors, clean surface, and sharp corners — scans are from the actual card you will receive. ' +
          'Ships in a rigid top-loader inside a bubble mailer for full protection.'
        );
      },
      price: function (input) {
        var lo, hi;
        if (/pokemon|charizard|pikachu|mewtwo|holo|1st edition/i.test(input)) {
          lo = rand(15, 80); hi = lo + rand(20, 120);
        } else if (/psa|bgs|graded|grade/i.test(input)) {
          lo = rand(30, 100); hi = lo + rand(25, 100);
        } else {
          lo = rand(3, 15); hi = lo + rand(5, 10);
        }
        return { low: lo, high: hi };
      },
      rationale: 'Range reflects recent sold listings for comparable cards in similar condition on eBay.',
      condition: 'Near mint to mint. Corners sharp, surface clean, no creases or print defects. Stored in sleeve — never played.',
      tags: ['trading card', 'collectible card', 'card lot', 'near mint', 'TCG', 'collector', 'card game', 'rare card']
    },

    JEWELRY: {
      category: 'Vintage Jewelry',
      title: function (input) {
        return 'Vintage ' + itemLabel(input) + ' — Estate Piece, Tested';
      },
      description: function (input) {
        var label = itemLabel(input);
        return (
          label + ' sourced from a local estate collection — a genuine vintage piece with the craftsmanship rarely found in modern jewelry. ' +
          'Metal has been tested and any markings or stamps are clearly pictured; clasp and settings are fully functional. ' +
          'Light tarnish present on some surfaces which polishes out easily; listed as-found for transparency.'
        );
      },
      price: function (input) {
        var lo = rand(35, 75);
        if (/sterling|silver|gold|diamond|sapphire|ruby|emerald/i.test(input)) lo = rand(55, 110);
        return { low: lo, high: lo + rand(20, 40) };
      },
      rationale: 'Priced against recent sold comps for estate jewelry of similar metal, style, and era.',
      condition: 'Functional with no structural damage. Light wear and patina consistent with vintage age. All stones secure, clasps work smoothly.',
      tags: ['vintage jewelry', 'estate jewelry', 'antique jewelry', 'collectible', 'costume jewelry', 'statement piece', 'gift idea', 'retro fashion']
    },

    TOYS: {
      category: 'Vintage Toys & Games',
      title: function (input) {
        return 'Vintage ' + itemLabel(input) + ' — Classic Collectible, See Photos';
      },
      description: function (input) {
        var label = itemLabel(input);
        return (
          label + ' in solid vintage condition — a nostalgic piece that brings back childhood memories for collectors and gift-givers alike. ' +
          'All key components present as shown in photos; any wear or missing parts clearly noted and pictured. ' +
          'Stored in a smoke-free home; ships securely packaged to protect during transit.'
        );
      },
      price: function (input) {
        var lo = rand(20, 50);
        if (/lego|star wars|barbie|gi joe|hot wheels|matchbox|transformers/i.test(input)) lo = rand(35, 85);
        if (/original|box|sealed|complete|mint/i.test(input)) lo = rand(55, 100);
        return { low: lo, high: lo + rand(15, 35) };
      },
      rationale: 'Based on sold eBay comps for comparable vintage toys in similar condition and completeness.',
      condition: 'Solid vintage condition. Shows age-appropriate wear. No cracks or breaks to main structure. Completeness noted in photos.',
      tags: ['vintage toy', 'retro collectible', 'classic toy', 'nostalgia', 'kids collectible', 'estate find', 'toy collector', '80s 90s toy']
    },

    BOOKS: {
      category: 'Books & Paper Collectibles',
      title: function (input) {
        return itemLabel(input) + ' — Vintage Edition, Collector Copy';
      },
      description: function (input) {
        var label = itemLabel(input);
        return (
          label + ' in solid readable condition with intact binding and clean pages — a genuine vintage printing worth adding to any collection or reference shelf. ' +
          'Cover shows age-appropriate shelf wear; interior pages are free of heavy markings or water damage as pictured. ' +
          'A great find for readers, researchers, or collectors who appreciate original editions over modern reprints.'
        );
      },
      price: function (input) {
        var lo = rand(8, 22);
        if (/first edition|signed|1st|rare|out of print/i.test(input)) lo = rand(22, 40);
        if (/comic|marvel|dc|batman|superman/i.test(input)) lo = rand(15, 35);
        return { low: lo, high: lo + rand(5, 15) };
      },
      rationale: 'Priced to match current sold comps for comparable vintage books and paper collectibles on eBay.',
      condition: 'Binding tight and intact. Pages clean with no heavy writing or foxing. Cover shows normal shelf wear for age.',
      tags: ['vintage book', 'collectible book', 'first edition', 'rare book', 'out of print', 'paper ephemera', 'book collector', 'estate find']
    },

    GENERAL_VINTAGE: {
      category: 'Vintage Collectible',
      title: function (input) {
        return 'Vintage ' + itemLabel(input) + ' — Estate Find, Ready to Ship';
      },
      description: function (input) {
        var label = itemLabel(input);
        return (
          label + ' sourced from a local estate sale — the kind of authentic vintage piece that\'s getting harder to find in this condition. ' +
          'Photos show the actual item you\'ll receive; any wear or imperfections are clearly pictured and noted honestly. ' +
          'Carefully cleaned, wrapped, and ready to ship to its next home.'
        );
      },
      price: function (input) {
        var lo = rand(20, 45);
        if (/antique|rare|signed|original|numbered|limited/i.test(input)) lo = rand(40, 65);
        return { low: lo, high: lo + rand(15, 30) };
      },
      rationale: 'Range based on recent sold comps for comparable vintage items in similar condition on eBay and Etsy.',
      condition: 'Good vintage condition consistent with age and prior use. No major damage. Clean and ready to display or use.',
      tags: ['vintage', 'estate sale find', 'collectible', 'antique', 'retro', 'mid century', 'unique find', 'home decor']
    }

  };


  // ---- Keyword Matcher ----

  function detectTemplate(input) {
    var s = input.toLowerCase();

    if (/vase|bowl|glass|ceramic|pottery|jug|pitcher|decanter|crock|planter|urn|dish|plate|mug|teapot|cup/.test(s)) {
      return 'GLASSWARE';
    }
    if (/\bcard\b|cards|pokemon|sports card|trading card|baseball card|football card|basketball card|yugioh|magic card|mtg|tcg/.test(s)) {
      return 'TRADING_CARDS';
    }
    if (/jewelry|jewellery|\bring\b|necklace|bracelet|brooch|earring|\bpin\b|pendant|locket|choker|bangle|cuff|cameo/.test(s)) {
      return 'JEWELRY';
    }
    if (/\btoy\b|toys|doll|action figure|lego|board game|figurine|playset|stuffed animal|plush|puzzle|game piece/.test(s)) {
      return 'TOYS';
    }
    if (/\bbook\b|books|magazine|comic|manual|guide|cookbook|novel|paperback|hardcover|pamphlet|zine/.test(s)) {
      return 'BOOKS';
    }
    return 'GENERAL_VINTAGE';
  }


  // ---- DOM refs ----

  var generateBtn   = document.getElementById('generate-btn');
  var itemInput     = document.getElementById('item-input');
  var outputSection = document.getElementById('output-section');
  var analyzingCard = document.getElementById('output-analyzing');
  var resultCard    = document.getElementById('output-result');
  var photoInput    = document.getElementById('photo-input');
  var thumbGrid     = document.getElementById('thumb-grid');
  var uploadArea    = document.getElementById('upload-area');
  var copyBtn       = document.getElementById('copy-btn');
  var resetBtn      = document.getElementById('reset-btn');
  var copyConfirm   = document.getElementById('copy-confirm');

  // Result slots
  var elCategory    = document.getElementById('result-category');
  var elTitle       = document.getElementById('result-title');
  var elPrice       = document.getElementById('result-price');
  var elRationale   = document.getElementById('result-rationale');
  var elDescription = document.getElementById('result-description');
  var elCondition   = document.getElementById('result-condition');
  var elTags        = document.getElementById('result-tags');

  var currentTitle  = '';
  var currentDesc   = '';


  // ---- Photo upload thumbnails ----

  if (photoInput) {
    photoInput.addEventListener('change', function () {
      thumbGrid.innerHTML = '';
      Array.from(photoInput.files).forEach(function (file) {
        var img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        img.className = 'thumb-img';
        img.loading = 'lazy';
        thumbGrid.appendChild(img);
      });
    });
  }

  if (uploadArea) {
    uploadArea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        photoInput.click();
      }
    });
  }


  // ---- Generate ----

  function generate() {
    var raw = itemInput ? itemInput.value.trim() : '';
    if (!raw) {
      itemInput.focus();
      itemInput.style.borderColor = '#ef4444';
      setTimeout(function () { itemInput.style.borderColor = ''; }, 1800);
      return;
    }

    // Show output section with analyzing state
    outputSection.hidden = false;
    analyzingCard.hidden = false;
    resultCard.hidden    = true;
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 1.2 second simulated analysis delay then reveal result
    setTimeout(function () {
      var key      = detectTemplate(raw);
      var tmpl     = TEMPLATES[key];
      var price    = tmpl.price(raw);
      var title    = tmpl.title(raw);
      var desc     = tmpl.description(raw);
      var tags     = tmpl.tags;
      var rationale = typeof tmpl.rationale === 'function'
        ? tmpl.rationale(raw)
        : tmpl.rationale;

      currentTitle = title;
      currentDesc  = desc;

      // Populate result card
      elCategory.textContent    = tmpl.category;
      elTitle.textContent       = title;
      elPrice.textContent       = 'Suggested: $' + price.low + ' — $' + price.high;
      elRationale.textContent   = rationale;
      elDescription.textContent = desc;
      elCondition.textContent   = tmpl.condition;

      elTags.innerHTML = tags.map(function (t) {
        return '<span class="tag-chip">' + esc(t) + '</span>';
      }).join('');

      // Switch cards
      analyzingCard.hidden = true;
      resultCard.hidden    = false;

    }, 1200);
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);

  if (itemInput) {
    itemInput.addEventListener('keydown', function (e) {
      // Ctrl/Cmd + Enter submits
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate();
    });
  }


  // ---- Copy listing ----

  function copyListing() {
    var text = currentTitle + '\n\n' + currentDesc;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showCopyConfirm, fallbackCopy.bind(null, text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
    showCopyConfirm();
  }

  function showCopyConfirm() {
    copyConfirm.classList.add('is-visible');
    setTimeout(function () {
      copyConfirm.classList.remove('is-visible');
    }, 3000);
  }

  if (copyBtn) copyBtn.addEventListener('click', copyListing);


  // ---- Reset ----

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      outputSection.hidden = true;
      resultCard.hidden    = true;
      analyzingCard.hidden = true;
      if (itemInput) { itemInput.value = ''; itemInput.focus(); }
      thumbGrid.innerHTML = '';
    });
  }

})();
