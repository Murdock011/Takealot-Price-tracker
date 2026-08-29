# Takealot Price Tracker

A [Tampermonkey](https://www.tampermonkey.net/) userscript that adds two things to
every [Takealot](https://www.takealot.com) product page:

- **Price History button** — opens the product's page on
  [servaltracker.com](https://www.servaltracker.com) in a popup, so you can see
  how the price has moved over time.
- **Adjusted rating** — a [Bayesian-adjusted](https://fulmicoton.com/posts/bayesian_rating/)
  version of the star rating that isn't fooled by a "5 / 5 from 2 reviews".

Both are injected into the buybox, just above **Add to Cart**.

## Install

1. Install the Tampermonkey browser extension.
2. Open
   [`Takealot Price Tracker.user.js`](Takealot%20Price%20Tracker.user.js?raw=1)
   — Tampermonkey will offer to install it.
3. Visit any product page on `www.takealot.com`.

## The adjusted rating

Takealot shows a raw average and a review count (e.g. `4.3 (140)`). A raw average
is unreliable when the count is low, so the script blends it with a prior:

```
adjusted = (PRIOR_WEIGHT * PRIOR_MEAN + average * count) / (PRIOR_WEIGHT + count)
```

It behaves as if every product starts with `PRIOR_WEIGHT` imaginary reviews
sitting at `PRIOR_MEAN`. Products with few real reviews are pulled toward the
prior; heavily-reviewed products barely move.

| Raw average | Reviews | Adjusted |
|------------:|--------:|---------:|
| 5.0 | 2 | 3.8 |
| 4.3 | 140 | 4.2 |
| 4.0 | 228 | 4.0 |
| 3.5 | 1024 | 3.5 |

Defaults are `PRIOR_MEAN = 3.5` and `PRIOR_WEIGHT = 10`, set as constants near the
top of the script — tune them to taste. When a page shows a rating with no review
count, the script just displays the raw average.

## Notes

- Only runs on `https://www.takealot.com/*`.
- Handles Takealot's single-page-app navigation: the UI is re-injected when you
  move between products without a full page reload.
- Takealot periodically rewrites its markup. The script tries several buybox
  selectors from most to least specific; if it ever stops appearing, the buybox
  selector list near the top of the file is the place to look.

## License

MIT — see [LICENSE](LICENSE).
