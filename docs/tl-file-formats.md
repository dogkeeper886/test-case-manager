# Import / export file formats

## TestLink version 1.

##### Author: Francisco Mancardi

##### Version: 1.

##### Status: Updated for TL 1.

© 2004 - 2010 TestLink Community

Permission is granted to copy, distribute and/or modify this document under the terms of the GNU Free Documentation
License, Version 1.2 published by the Free Software Foundation; with no Invariant Sections, no Front-Cover Texts, and
no Back-Cover Texts. The license is available in "GNU Free Documentation License" homepage.


##### Revision History

##### # Description Date Author

##### 0.1 Initial document 20070728 Francisco Mancardi

##### 0.2 Added XLS format for test cases. Code contributed by

##### lightbulb

##### Added XML format for results

##### 20071101 Francisco Mancardi

##### 0.3 Notes about internal and external ID

##### New tag supported for results on TL 1.

##### 20080911 Francisco Mancardi

##### 0.4 Test Case XML – added support for custom fields 20090106 Francisco Mancardi

##### 0.5 Test Case XML – added support for link requirements 20090207 Francisco Mancardi

##### 0.6 Updated Format for version 1.9 20100227 Francisco Mancardi

1.0 (^) Updated documentation layout, corrected license,

##### merged information from User manual (docbook

##### support,etc.)

##### 04/03/10 Martin Havlat


### 1 Introduction

##### TestLink is web based Test Management tool. This manual describes a format of files for

##### import and export data.

##### See the User manual and Installation manual for more information about tool. The latest

##### documentation is available on web http://www.teamst.org .Feel free to use our forum if you

##### have questions that the manual doesn't answer.

## Table of Contents

##### 1 Introduction 3

##### 2 Import and Export data 4

##### 2.1 Export/Import Test Project 4

##### 2.2 Import/Export Test suite 5

##### 2.3 Just one Test Case 6

##### 2.4 All Test Cases in test suite 9

##### 2.5 Import/Export Keywords 9

##### 2.6 Import/Export Software Requirements 10

##### 2.7 Results import 12

##### 2.8 Import Test Cases from Excel via XML 12

##### 2.9 Platforms 14

##### 2.10 Custom Fields 16


### 2 Import and Export data

##### TestLink supports several ways to share data. See the next table for overview. In addition you

##### can consider to use TestLink API to deliver supported data.

##### There is amount of file examples in directory testlink/docs/file_examples/.

##### Troubleshooting: No answer for import action? Check size of imported file. There are limits in

##### TestLink configuration and web server settings. Check if DOM module is loaded for your web

##### server.

##### Item File format Import Export Notes

```
Test project XML X X All test suites and test cases.
You can choose if export also assigned keywords.
Test suite XML X X Test suite details, All test cases and child test suites and
test cases.
You can choose if export assigned keywords.
Test case XML X X Two types of exports can be done:
```
- Just one test case
- All test cases in test suite.
Custom Fields and Requirements assigned are exported.
Keywords export is optional.
Test case XLS X Keywords import is NOT supported.
Keyword CSV, XML X X All test project’s keywords
Requirement CSV, XML X X
Requirement CSV DOORS,
DocBook

###### X

```
Results XML X
```
##### Platforms XML X X New on 1.

##### Custom Fields XML X X New on 1.

##### Table 1 : Items that can be exported/imported

##### Limitation: Attached files and custom fields^1 are not imported/exported.

##### Table format (CSV) is not directly supported in some cases. You should convert it into

##### XML before import. See below for more.

##### Definition for Internal and Documentation Identifiers

- Every object has its internal ID , this ID is value of ID column in database table
- Test cases and requirements are special case because they have internal and document

##### ID.

- Every time you see keyword ID in xml format it indicates INTERNAL ID.

#### 2.1 All Test Project

##### User can import or export Test Project including Description of the project, Test Specification

##### and Keywords. The next two pictures show tree menu with data and the same data as XML file.

##### Warning: You can rich a server memory limit for larger amount of Test cases.

##### 1 CF except Test cases.


```
<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="">
<details><![CDATA[]]></details>
<testsuite name="Communications">
<details><![CDATA[<p>Communication Systems of all
types</p>]]></details>
<testsuite name="Hand-held devices">
<details><![CDATA[]]></details>
<testcase name="10 G shock">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><!
[CDATA[]]></expectedresults>
</testcase>
<testcase name="Gamma Ray Storm">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
</testcase>
</testsuite>
<testsuite name="Subspace channels">
<details><![CDATA[<p>Only basic subspace features</p>]]></details>
<testcase name="Black hole test">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
</testcase>
</testsuite>
</testsuite>
```
```
<testsuite name="Holodeck">
<details><![CDATA[]]></details>
<testcase name="Light settings">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
</testcase>
</testsuite>
<testsuite name="Propulsion Systems">
<details><![CDATA[]]></details>
<testsuite name="Main engine">
<details><![CDATA[]]></details>
<testcase name="Emergency stop">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
</testcase>
</testsuite>
</testsuite>
</testsuite>
```
#### 2.2 Import/Export Test suite

##### XML Example – Test Suite without keywords

```
<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Hand-held devices">
<details><![CDATA[]]></details>
<testcase name="10 G shock">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
</testcase>
<testcase name="Gamma Ray Storm">
```

```
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
</testcase>
</testsuite>
```
##### XML format example: Test Suite with keywords

```
<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Hand-held devices">
<details><![CDATA[]]></details>
<testcase name="10 G shock">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
<keywords>
<keyword name="Klyngon">
<notes><![CDATA[Klyngon keyword notes]]></notes>
</keyword>
</keywords>
</testcase>
<testcase name="Gamma Ray Storm">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
<keywords>
<keyword name="Klyngon">
<notes><![CDATA[Klyngon keyword notes]]></notes>
</keyword>
<keyword name="Moon rocks">
<notes><![CDATA[Moon rocks keyword notes]]></notes>
</keyword>
</keywords>
</testcase>
</testsuite>
```
#### 2.3 Just one Test Case


##### Example of XML file: Test case with keyword

```
<?xml version="1.0" encoding="UTF-8"?>
<testcases>
<testcase name="Black hole test">
<summary>
<![CDATA[<p>This procedure must be done once a week, with this safety device
disabled:</p>
<ol><li>X45HH</li><li>YY89-000-JI</li></ol>]]>
</summary>
<steps ><![CDATA[
<p>Preset bias to 0</p>
<p>Enable <strong>long range</strong> communications control</p>
<p>Simulate black hole interference</p>]]> </steps>
<expectedresults ><![CDATA[
<table width="200" cellspacing="1" cellpadding="1" border="1">
<caption>Main Results</caption>
<tbody>
<tr><td>Spin value</td><td>9.9</td></tr>
<tr><td>Opposite Angle</td><td>18 rad</td></tr>
<tr><td>&nbsp;</td><td>&nbsp;</td></tr>
</tbody>
</table>]]>
</expectedresults>
<keywords>
<keyword name="Moon rocks">
<notes><![CDATA[Moon rocks keyword notes]]></notes>
</keyword>
</keywords>
</testcase>
</testcases>
```
##### Example : XML – Test Case with custom fields

```
<?xml version="1.0" encoding="UTF-8"?>
<testcases>
<testcase name="Black Hawk test">
<summary>
<![CDATA[<p>This procedure must be done once a week, with this safety device
disabled:</p>
<ol><li>X45HH</li><li>YY89-000-JI</li></ol>]]>
```

```
</summary>
<steps><![CDATA[
<p>Preset bias to 0</p>
<p>Enable <strong>long range</strong> communications control</p>
<p>Simulate black hole interference</p>]]>
</steps>
<expectedresults><![CDATA[
<table width="200" cellspacing="1" cellpadding="1" border="1">
<caption>Main Results</caption>
<tbody>
<tr><td>Spin value</td><td>9.9</td></tr>
<tr><td>Opposite Angle</td><td>18 rad</td></tr>
<tr><td>&nbsp;</td><td>&nbsp;</td></tr>
</tbody>
</table>]]>
</expectedresults>
<custom_fields>
<custom_field>
<name><![CDATA[CF_SKILLS_NEEDED]]></name>
<value><![CDATA[QA Engineer]]></value>
</custom_field>
<custom_field>
<name><![CDATA[CF_ESTIMATED_EXEC_TIME]]></name>
<value><![CDATA[12]]></value>
</custom_field>
</custom_fields>
</testcase>
</testcases>
```
##### Example: XML – Test Case with requirements

```
<?xml version="1.0" encoding="UTF-8"?>
<testcases>
<testcase internalid="12644" name="High speed">
<node_order><![CDATA[0]]></node_order>
<externalid><![CDATA[182]]></externalid>
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
<requirements>
<requirement>
<req_spec_title><![CDATA[RSPEC-001]]></req_spec_title>
<doc_id><![CDATA[ENG-0002]]></doc_id>
<title><![CDATA[Main Deflector]]></title>
</requirement>
<requirement>
<req_spec_title><![CDATA[RSPEC-001]]></req_spec_title>
<doc_id><![CDATA[DOC-009]]></doc_id>
<title><![CDATA[James Bond]]></title>
</requirement>
</requirements>
</testcase>
```
```
<testcase internalid="12646" name="Half speed stop">
<node_order><![CDATA[0]]></node_order>
<externalid><![CDATA[183]]></externalid>
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
<requirements>
<requirement>
<req_spec_title><![CDATA[RSPEC-001]]></req_spec_title>
<doc_id><![CDATA[ENG-0002]]></doc_id>
<title><![CDATA[Main Deflector]]></title>
</requirement>
<requirement>
<req_spec_title><![CDATA[RSPEC-001]]></req_spec_title>
<doc_id><![CDATA[DOC-009]]></doc_id>
```

```
<title><![CDATA[James Bond]]></title>
</requirement>
</requirements>
</testcase>
```
```
<testcase internalid="12648" name="Jump start">
<node_order><![CDATA[0]]></node_order>
<externalid><![CDATA[184]]></externalid>
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
<requirements>
<requirement>
<req_spec_title><![CDATA[RSPEC-001]]></req_spec_title>
<doc_id><![CDATA[ENG-0002]]></doc_id>
<title><![CDATA[Main Deflector]]></title>
</requirement>
<requirement>
<req_spec_title><![CDATA[RSPEC-001]]></req_spec_title>
<doc_id><![CDATA[DOC-009]]></doc_id>
<title><![CDATA[James Bond]]></title>
</requirement>
</requirements>
</testcase>
</testcases>
```
#### 2.4 All Test Cases in test suite

```
<?xml version="1.0" encoding="UTF-8"?>
<testcases>
<testcase name="10 G shock">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
</testcase>
<testcase name="Gamma Ray Storm">
<summary><![CDATA[]]></summary>
<steps><![CDATA[]]></steps>
<expectedresults><![CDATA[]]></expectedresults>
</testcase>
</testcases>
```
##### Test cases in XLS format

##### Every row must have four columns:

##### Column

##### number

##### Contents

```
1 Test case name
2 summary
3 steps
```

```
4 Expected results
```
##### First row will be skipped, because is supposed it contains column descriptions.

##### Example:

```
Name Summary Steps Expected results
```
```
Engine fast start up Start up on 5 second Too fast write steps Kind nothing
```
```
Engine emergency stop Engine stop due to panic
button.
```
1. Unlock panic button
2. Press panic button
3. Press confirm

```
Engine must stop right
now
```
```
Etc. Etc. Etc. Etc.
```
#### 2.5 Import/Export Keywords

##### Illustration 1 : Keywords frame includes buttons for import and export

##### Example of CSV “Keyword;Notes”:

##### Klyngon;Klyngon keyword notes

##### Moon rocks;Moon rocks keyword notes

##### Example of XML with keywords:

```
<?xml version="1.0" encoding="UTF-8"?>
<keywords>
<keyword name="Klyngon">
<notes>
<![CDATA[Klyngon keyword notes]]>
</notes>
</keyword>
<keyword name="Moon rocks">
<notes>
<![CDATA[Moon rocks keyword notes]]>
</notes>
</keyword>
</keywords>
```
#### 2.6 Import/Export Software Requirements


##### CSV file includes “Identifier of document, title, description”.

##### Example of CSV file:

```
ENG-0001,Terrestrial Propulsor,
ENG-0002,Main Deflector,"<p>Main deflector bla, bla, bla.</p>"
```
##### Example of XML file:

```
<?xml version="1.0" encoding="UTF-8"?>
<requirements>
<requirement>
<docid><![CDATA[ENG-0001]]></docid>
<title><![CDATA[Terrestrial Propulsor]]></title>
<description><![CDATA[]]></description>
</requirement>
<requirement>
<docid><![CDATA[ENG-0002]]></docid>
<title><![CDATA[Main Deflector]]></title>
<description><![CDATA[<p>Maindeflector bla, bla, bla.</p>]]></description>
</requirement>
</requirements>
```
#### 2.7 Import rich text format requirements via DocBook

##### There is limited support of import for documents in such formats as is MSWord or openoffice.

##### You can export original document as DocBook (tested with openoffice2 and 3). Choose import

##### button for your SRS in TestLink. Select type “DocBook”.

##### The exported file is XML. Basic element for default settings could be the next:

###### ...

```
<sect3>
<title>Title</title>
...
<para>Description</para>
...
<orderedlist>
<listitem>Item</listitem>
...
</orderedlist>
...
<informaltable>
<tgroup>
<thead>
<row> ... <entry></entry> ... </row>
</thead>
<tbody>
<row> ... <entry></entry> ... </row>
</tbody>
</tgroup>
</informaltable>
```

###### ...

```
</sect3>
```
##### TestLink uses such element as data for just one requirement. This element is defined via

##### constant DOCBOOK_REQUIREMENT (check the code). i.e. <sect3> is default but could be

##### modified.

##### Each requirement content is maintain the following way:

##### title – receive text in tag <title>

##### req_doc_id – parse title for the first two words and add counter. You can modify

##### regular expression directly in code. Default is "[ a-zA-Z_]*[0-9]*".

##### description – parse following elements after title (<para>, <orderedlist>,

##### <informaltable>, etc.). DocBook elements are modified to HTML tags. Unknown ones

##### are ommited.

##### Warning: the original code could be modified to fit your structure of DocBook. Check

##### requirement.inc.php ( function importReqDataFromDocBook($fileName)) and related

##### constants.

##### Warning: generated REQ_DOC_ID is danger for the case of update. Because it's

##### generated from file content without relation to existing testlink data.

#### 2.8 Results import

##### Results import is supported from TL 1.7.

##### Example 1: Results in XML format (using internal ID)

```
<?xml version="1.0" encoding="UTF-8"?>
<results>
<testcase id="100"> <!-- ID: internal/DB id --->
<result>p</result>
<notes>functionality works great </notes>
</testcase>
<testcase id="200">
<result>f</result>
<notes>this case failed due to error </notes>
</testcase>
<testcase id="150">
<result>b</result>
<notes>this test case is blocked</notes>
</testcase>
</results>
```
##### Example 2: Results in XML format (using external ID)

```
2
```
```
<?xml version="1.0" encoding="UTF-8"?>
<!-- Comment -->
<results>
<testcase external_id="POL-1" >
<!-- if not present logged user will be used -->
<tester>u0113</tester> <!-- tester LOGIN Name--->
<!-- if not present now() will be used -->
<timestamp>2008-09-08 14:00:00</timestamp>
<result>p</result>
<notes>functionality works great </notes>
</testcase>
```
```
<testcase external_id="POL-1" > <!-- ANOTHER EXE for SAME test case --->
<result>f</result>
<notes>functionality works great KIMI</notes>
</testcase>
```
##### 2 Format supported on TL 1.8 beta 3 and UP


```
<testcase external_id="1256" > <!-- Using INTERNAL ID --->
<result>f</result>
<notes>Using INTERNAL ID as link </notes>
</testcase>
</results>
```
##### You can import several / multiple execution results using a single XML file

#### 2.9 Import Test Cases from Excel via XML

##### Creating XML file to import in TestLink

##### Step 1. Export one or more dummy Test Cases from TestLink into a XML file.

##### Step 2. Open new blank spread sheet document file.

##### Step 3. Navigate through menu bar Data > XML > Import & select the sample XML file. It

##### creates appropriate structure in Excel.

##### Step 4. Then we will get dialog box asking "Where do you want to put the data?"



##### Step 5. Choose option one "XML list in existing worksheet" with first cell $A$

##### Step 6. You will be able to see following columns : name, summary, steps & expected results

##### Step 7. Copy your data into this file accordingly & save the file in XML Data

##### (*.xml) format

##### Step 8. Check your XML file for correctness by opening with the help of internet

##### explorer.


##### Importing XML file into TestLink

##### Step 1. Login in to TestLink > Select your project in dropdown list.

##### Step 2. Click on Specification > Create New Suite > Select Suite > Click on Import Test Cases

##### Step 3. Browse for the XML file, submit it and you are done with the Importing.

#### 2.10 Platforms

##### Platforms can be both imported and exported. The feature is available from TL 1.


##### Example of data:

```
<?xml version='1.0' encoding='UTF-8'?>
<platforms>
<platform>
<name><![CDATA[MAC OS]]></name>
<notes><![CDATA[]]></notes>
</platform>
<platform>
<name><![CDATA[Solaris 10]]></name>
<notes><![CDATA[New Solaris]]></notes>
</platform>
<platform>
<name><![CDATA[Solaris 8]]></name>
<notes><![CDATA[]]></notes>
</platform>
<platform>
<name><![CDATA[Solaris 9]]></name>
<notes><![CDATA[]]></notes>
</platform>
<platform>
<name><![CDATA[Windows 2008]]></name>
<notes><![CDATA[]]></notes>
</platform>
<platform>
<name><![CDATA[Windows 7]]></name>
<notes><![CDATA[New MS OS]]></notes>
</platform>
</platforms>
```

#### 2.11 Custom Fields

##### Definition of custom field can be both in imported and exported since TL 1.9.

##### Example of definition file:

```
<?xml version='1.0' encoding='ISO-8859-1'?>
<custom_fields>
<custom_field>
<name><![CDATA[CF_STRING]]></name>
<label><![CDATA[String CF]]></label>
<type><![CDATA[0]]></type>
<possible_values><![CDATA[]]></possible_values>
<default_value><![CDATA[]]></default_value>
<valid_regexp><![CDATA[]]></valid_regexp>
<length_min><![CDATA[0]]></length_min>
<length_max><![CDATA[0]]></length_max>
<show_on_design><![CDATA[1]]></show_on_design>
<enable_on_design><![CDATA[1]]></enable_on_design>
<show_on_execution><![CDATA[1]]></show_on_execution>
<enable_on_execution><![CDATA[0]]></enable_on_execution>
<show_on_testplan_design><![CDATA[0]]></show_on_testplan_design>
<enable_on_testplan_design><![CDATA[0]]></enable_on_testplan_design>
<node_type_id><![CDATA[3]]></node_type_id>
</custom_field>
<custom_field>
<name><![CDATA[CF_LIST]]></name>
<label><![CDATA[List Type CF]]></label>
<type><![CDATA[6]]></type>
<possible_values><![CDATA[Deep Purple|Yes|Queen]]></possible_values>
<default_value><![CDATA[]]></default_value>
<valid_regexp><![CDATA[]]></valid_regexp>
<length_min><![CDATA[0]]></length_min>
<length_max><![CDATA[0]]></length_max>
<show_on_design><![CDATA[1]]></show_on_design>
<enable_on_design><![CDATA[1]]></enable_on_design>
<show_on_execution><![CDATA[0]]></show_on_execution>
<enable_on_execution><![CDATA[0]]></enable_on_execution>
<show_on_testplan_design><![CDATA[0]]></show_on_testplan_design>
<enable_on_testplan_design><![CDATA[0]]></enable_on_testplan_design>
<node_type_id><![CDATA[3]]></node_type_id>
</custom_field>
</custom_fields>
```
##### Illustration 2 : Custom field management window with Import and Export actions



