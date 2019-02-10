# Tutorials/Examples

Here's a list of examples of usage of `etl-js-cli`.

Note that, knowledge of certain technologies (e.g. ECL, MySQL) used here will make things easier (especially troubleshooting), but it is NOT REQUIRED to run those examples.

Knowledge of `etl-js` is also not necessary since all tutorials will explain step by step how it (`etl-js`) works.


# ECL

## Precipitation and Snow Chart

This advanced tutorial goes from downloading a file from ftp and generating a url to visualize a summary from that data.
[It's available here](prcp_snow_chart.md).

Things you will learn:

1. Downloading file from ftp (same for http).
2. Extract content from file downloaded (.gz).
3. Load (`spray`) file content into Thor cluster.
4. Run ECL queries for different purposes (certification, transformation and reporting).
5. Generate a url to be used with image-charts.com (no registration required, you solely choose or not to open that url in a browser).


# MySQL

## mysqlimports

This simple tutorial shows how one would import data into a MySQL database using the `mysqlimports` mod.
[It's available here](mysqimports.md).

Things you will learn:

1. Creating test data with the use of `files` mod.
2. Importing content of file into MySQL DB using the `mysqlimports` mod.



# Troubleshooting

No need right? Everything went fine. But just in case...
This applies to all example mentioned above.

## Done (with errors).

When this happens, the best course of action is to check the log file `etl-js.log`.
Either load it in your favorite editor or do something like this:

```bash
jq '.' etl-js.log
```

### Error: Error: Timed out while waiting for handshake

This is most likely due to the fact that the VM is not running, or IP address is wrong in your `settings.yml`.
Make sure to follow the steps detailed in [Prerequisites](#prerequisites) section.

### Error: Error: All configured authentication methods failed

This error is typically due to wrong (or missing) settings for the remote executor.
Make sure you filled out the `settings.yml` file as explained in [ETL-JS CLI](#etl-js-cli) section.


### Error: (...) Error connecting to 127.0.0.1:8010 (...) connection failed

The port *8010* is something specific to HPCC Systems. This most likely means the HPCC Systems Cluster is not up and running. SSH into the VM and start it like so:

```bash
ssh hpccdemo@_IP_ADDRESS_OF_VM_
sudo /etc/init.d/hpcc-init start
```

You should see something like this, indicating everything is now running:

> Starting mydali ...            [   OK    ]   
> Starting mydfuserver ...       [   OK    ]   
> Starting myeclagent ...        [   OK    ]   
> Starting myeclccserver ...     [   OK    ]   
> Starting myeclscheduler ...    [   OK    ]   
> Starting myesp ...             [   OK    ]   
> Starting myroxie ...           [   OK    ]   
> Starting mysasha ...           [   OK    ]   
> Starting mythor ...            [   OK    ]


