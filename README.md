Instagram research CLI
===============

This application is an example of how to retrieve and process results from a questionnaire published on Instagram stories. It was used in a research relating to the reputation of Nike among young customers.

Note that if you want to use this app, you will probably have to make changes to the code to make it suit your needs. For instance, certain values required for this research (like filter thresholds, output directories) are hardcoded into the program.

* [`node index.js get`](#node-indexjs-get)
* [`node index.js count`](#node-indexjs-get)
* [`node index.js convert`](#node-indexjs-get)
* [`node index.js csv --file FILE`](#node-indexjs-get)
* [`node index.js picture --file FILE`](#node-indexjs-get)
* [`node index.js scoresheet --file FILE`](#node-indexjs-get)

## `node index.js get`

Retrieve Instagram questionnaire data using the API.
It uses the `input.json` file and the `.env` file to request the desired data. This data is written to a JSON file, which contains all questionnaire data and the majority of metadata.

Note: the output file location is currently hardcoded inside `src/get.ts`.

```
Get Instagram questionnaire data


USAGE
  $ node index.js get
```

## `node index.js count`

The data retrieved using the `get` command can be counted using the `count` command. It will display a table with the amount of answers for each question.

Note: the table displays the amount of answers before any data cleaning is applied.

```
Count Instagram questionnaire data


USAGE
  $ node index.js count

OPTIONS
  --file  Location of data file to count
          If not provided, it will retrieve the most recent file

EXAMPLES
  $ node index.js count --file my_username-1631309028.json


╔════════════════════════════════════════════════════════════════════════════════════════╗
║                                        QUIZZES                                         ║
╟──────────────────────────────────────────────────────────────────────────────────┬─────╢
║ Do you wear Nike?                                                                │ 393 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Gender                                                                           │ 249 ║
╚══════════════════════════════════════════════════════════════════════════════════╧═════╝

╔════════════════════════════════════════════════════════════════════════════════════════╗
║                                     OPEN QUESTIONS                                     ║
╟──────────────────────────────────────────────────────────────────────────────────┬─────╢
║ Age                                                                              │ 231 ║
╚══════════════════════════════════════════════════════════════════════════════════╧═════╝

╔════════════════════════════════════════════════════════════════════════════════════════╗
║                                        SLIDERS                                         ║
╟──────────────────────────────────────────────────────────────────────────────────┬─────╢
║ Offers high quality products and services                                        │ 320 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Offers products and services that are a good value for the money                 │ 306 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Stands behind its products and services                                          │ 293 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Meets customer needs                                                             │ 290 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Acts responsibly to protect the environment                                      │ 275 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Supports good causes                                                             │ 260 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Has a positive influence on society                                              │ 258 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Is open and transparent about the way the company operates                       │ 244 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Behaves ethically                                                                │ 242 ║
╟──────────────────────────────────────────────────────────────────────────────────┼─────╢
║ Is fair in the way it does business                                              │ 237 ║
╚══════════════════════════════════════════════════════════════════════════════════╧═════╝

```

## `node index.js convert`

Convert the Instagram questionnaire data retrieved using the `get` command to a readable, better JSON file.
The empty slider values can either be left undefined or can be imputed using two-way (mean) imputation.

Note that incomplete answers are excluded based on a filter. At least 8 slider questions and all the required questions must have been answered.

```
Convert Instagram questionnaire data to readable JSON file


USAGE
  $ node index.js convert --file FILE

OPTIONS
  --file         Location of data file to convert
  --imputation   (boolean) Whether to apply two-way (mean) imputation

EXAMPLES
  $ node index.js convert --imputation --file my_username-1631735478.json
```

## `node index.js csv --file FILE`

Questionnaire data that has been converted into a readable JSON file using `convert` can be converted again, into a comma-separated values (CSV) file using the `csv` command.
The CSV file can be used as a data source in applications such as SPSS, JASP, Excel, LibreOffice Calc or Google Sheets.

```
Convert a JSON file to CSV


USAGE
  $ node index.js csv --file FILE

OPTIONS
  --file   (required) Location of the JSON file

EXAMPLES
  $ node index.js csv --file my_username-1631735478.json
```

## `node index.js picture --file FILE`

Based on the usernames of the respondents, their profile pictures can be downloaded from Instagram. The questionnaire data retrieved using the `get` command should be used as input.

```
Retrieve Instagram profile pictures of respondents


USAGE
  $ node index.js picture --file FILE

OPTIONS
  --file   (required) Location of the JSON input file

EXAMPLES
  $ node index.js picture --file my_username-1631735478.json
```

For instance, combining hundreds of profile pictures into a photo collage can be an interesting visual when presenting the research. Using `montage` (available on many Linux distributions and Homebrew) the profile pictures can be combined into a collage:

`montage -tile 42x11 -geometry 120x120+0+0 'folder/*.jpg' out_v1.jpg`

Note the width (42) and height (11) in the command, based on the amount of profile pictures.

## `node index.js scoresheet --file FILE`

Convert the answers of selected respondents to a scoresheet (image files).
The scoresheet displays their answers on a slider (similar to Instagram), but also displaying their answer as a value between 0 - 100.

```
Save scoresheets of respondents


USAGE
  $ node index.js scoresheet --file FILE

OPTIONS
  --file   (required) Location of the JSON input file (obtained using convert command)
  --list   Location of username TXT list

EXAMPLES
  $ node index.js scoresheet --file my_username-1631735478.json --list scoresheet_list.txt
```

Note that the template with the sliders can be changed. If you change `src/scoresheet/template/js/main.js`, you should run the following command afterwards:

`browserify src/scoresheet/template/js/main.js -o src/scoresheet/template/js/bundle.js`
