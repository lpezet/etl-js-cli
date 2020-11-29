# Overview

This more advanced tutorial will explain how to go from a data source on the web to visualization of a summary of some of that data.
In this tutorial, you will learn:

1. How to download file from a url
2. Unzip the file you just downloaded. Other transformation could be done the same exact way, here the transformation is simply an "unzip"-ing.
3. Load file into am HPCC Systems Thor Cluster
4. Run ECL queries to make sure data was loaded properly, to transform raw format into final format and to create a summary of some of its content.
5. Generate an image-charts.com URL to visualise that summary in a browser.

# Audience

This tutorial is mostly intended for developers and system administrators/IT.
You need some knowledge of terminal, linux commands and how to set things up, including VirtualBox.

You do NOT need knowledge in HPCC Systems, but it might help (if anything goes wrong at that level).

# Table of contents

1. [Prerequisites](#Prerequisites)
   1. [HPCC Systems VM](#hpcc-systems-vm)
   2. [ETL-JS CLI](#etl-js-cli)
   3. [ETL file](#etl-file)
2. [Process](#process)
   1. [extract](#extract)
   2. [load](#load)
   3. [cert & transform](#cert-&-transform)
   4. [report](#report)
   5. [chart](#chart)
3. [Food for thoughts](#food-for-thoughts)
4. [Troubleshooting](#troubleshooting)

# Prerequisites

## HPCC Systems VM

For this tutorial, we simply need the HPCC System VM to run a single-node cluster inside VirtualBox for example.
Go to [https://hpccsystems.com/download](https://hpccsystems.com/download), select "Virtual Machine" and the platform you need (32bit or 64bit) and click "Download".

![HPCC Systems Download](./hpcc_systems_download_2.png)

Once downloaded, double-click on it and import it using VirtualBox for example.
Run the VM and when fully booted up, it will give you its internal IP address.

Check you can access it with ssh:

```bash
ssh hpccdemo@_IP_ADDRESS_
```

Password is `hpccdemo`.

### MySQL

In order for the ETL process to run, we need to install some piece of software.

SSH into your VM and go through the following steps.

#### mysql-server

```bash
apt-get install mysql-server -y
```

It will ask for admin password, just put anything you feel like, but make sure you can remember it.
Once installed, we'll add a new user to use during the ETL process.

```bash
mysql -u root -p -e "GRANT ALL PRIVILEGES ON testdb.* TO 'username'@'%' IDENTIFIED BY 'password'"
```

We'll use this `username`/`password` information in `settings.xml` later on.
We also need to create a table to host the data we will be importing:

```bash
mysql -u root -p -e "CREATE TABLE station_prcp_snow (station_id VARCHAR(100) PRIMARY KEY, prcp INT UNSIGNED NOT NULL, snow INT UNSIGNED NOT NULL)"
```

#### mysql-client

```bash
apt-get install mysql-client -y
```

## ETL-JS CLI

```bash
npm install --global @lpezet/etl-js-cli
```

Check it installed properly:

```bash
etl-js help
```

The help should be displayed.

To access the VM you will install right after, we need a bit of configuration too.
Create a folder to work in and run etl-js cli initialization command.

```bash
mkdir etl-js-tut
cd etl-js-tut
etl-js init
```

Two files will be created, but we're interested in only one: `settings.yml`.
Paste the following in it:

```yml
etl:
  executor: remote1

executors:
  remote1:
    type: remote
    host: _IP_ADDRESS_OF_VM_
    username: hpccdemo
    password: hpccdemo

mods:
  mysqlimports:
    "*":
      host: "127.0.0.1"
      user: "username"
      password: "password"
```

If you are curious, here's a bit of explanation.
The first part defines what kind of Executor to use to run ETL. Here we want to run it all on the VM, not on your machine itself (aka host).

```yml
etl:
  executor: remote1

executors:
  remote1:
    type: remote
    host: _IP_ADDRESS_OF_VM_
    username: hpccdemo
    password: hpccdemo
```

You'll need to replace the `_IP_ADDRESS_OF_VM_` with the actual IP address of your VM you got earlier.

The next part is to configure one of the mod our ETL process will be using: `mysqlimports`.
`mysqlimports` is a special mod for MySQL. It leverages (as you guessed it) `mysqlimport` to load content of files into a database.

```yml
mods:
  mysqlimports:
    "*":
      host: "127.0.0.1"
      user: "username"
      password: "password"
```

## ETL file

Last but not least, we'll also need the definition of our little ETL process.
The raw version is accessible here and contains more comments and information in it: [mysqlimports.yml](./mysqlimports.yml).

Download it and put it in the directory you created earlier.
We'll discuss in details each step.

# Process

If you're impatient (and checked everything is in order), go to next section to run it.
BE AWARE that commands will be run on your Virtual Machine, files will be downloaded and created.

Open that .yml file you just downloaded.

The first part of the file is the _etlSets_ section. Each entry define a set of activities, in order, to run.

```yml
etlSets:
  default:
    - extract
    - load
```

By default, the _default_ etl set will be run (unless told otherwise). By default then, it simply means it will first run the _extract_ activity, then the _load_ activity.
It will finish with the _chart_ activity which will create a url for us to visualize the result of that _report_ activity.

## extract

The _extract_ activity is here only to simplify the creation of test data.
It create a `/tmp/station_prcp_snow.csv` with CSV content in it, to be loaded in our MySQL database.

```yml
extract:
  files:
    "/tmp/station_prcp_snow.csv":
      content: |
        [SomethngToIgnore]
        "station_id","prcp","snow"
        "US1",123,456
        "US2",234,345
        "US3",345,567
```

As we will see in a minute, we can easily ignore those first 2 lines when importing its content.

## load

The _load_ activity simply loads the data we just extracted, into HPCC Systems Thor.

```yml
load:
  mysqlimports:
    "/tmp/test.csv":
      db_name: testdb
      columns: "station_id,prcp,snow"
      fields_terminated_by: ","
      lines_terminated_by: "\\n"
      fields_enclosed_by: '"'
      ignore_lines: 2
      delete: true
```

This loads the file specified in `sourcePath` and create a logical file `noaa::ghcn::daily::2018::raw` in Thor.
The default options are used here (comma-delimited, default terminators, etc.) so there isn't much to specify.
The next required elements we need to make sure are in there are `format` and `destinationGroup`.

# Run it

As mentioned earlier, BE AWARE that files will be downloaded and created and commands will be run on your Virtual Machine.

I recommend filtering activities when calling `etl-js` cli.
To run everything, simply use the following:

```bash
etl-js run mysqlimports.yml
```

To run only certain activities at a time, add the name of activity at the end of the previous command, and if you want to run more than one activity, separate those by a comma (",").
For the very first run, it might be best to go about it step by step: first run the _extrat_ activity (can check the file created and its content), then the _load_ activity.

```bash
etl-js run prcp_snow_chart.yml extract
# check file and content, if you'd like
etl-js run prcp_snow_chart.yml load
```

You can connect to your database now and check the content of the

# Food for thoughts

## Table name is not an option

Since `mysqlimports` mod simply leverages the `mysqlimport` command line software, there's no way to specify the name of the table (as of right now) through options. The name of the file MUST match the name of the table in the database (here it's _station_prcp_snow_).
