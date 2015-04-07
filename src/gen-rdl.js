var fs = require('fs');
var csvtojson = require('csvjson');
var _ = require('lodash');

var head = [
	"<?xml version='1.0' encoding='utf-8'?>",
	"<Report xmlns:rd='http://schemas.microsoft.com/SQLServer/reporting/reportdesigner' xmlns='http://schemas.microsoft.com/sqlserver/reporting/2008/01/reportdefinition'>",
	"<Width>{{width}}</Width>",
	"<Page>",
	"<LeftMargin>1in</LeftMargin>",
	"<RightMargin>1in</RightMargin>",
	"<TopMargin>1in</TopMargin>",
	"<BottomMargin>1in</BottomMargin>",
	"<Style />",
	"</Page>",
	"<rd:ReportID>{{guid}}</rd:ReportID>",
	"<rd:ReportUnitType>Inch</rd:ReportUnitType>",
	"</Report>"
];

var datasource = [
	"<DataSource Name='{{name}}'>",
	"<DataSourceReference>{{name}}</DataSourceReference>",
	"<rd:DataSourceID>{{guid}}</rd:DataSourceID>",
	"</DataSource>"
];

var dataSet = [
	"<DataSet Name='{{name}}'>",
	"<Fields>{{data_fields}}</Fields>",
	"<Query>",
	"<DataSourceName>{{source_name}}</DataSourceName>",
	"<CommandText>{{sql}}</CommandText>",
	"<re:UseGenericDesigner>true</rd:UseGenericDesigner>",
	"</Query>",
	"</DataSet>"
];

var fields = [
	"<Field Name='{{name}}'>",
	"<DataField>{{name}}</DataField>",
	"<rd:TypeName>{{type}}</rd:TypeName>"
];

var reportitems = [
	"<Tablix name='{{name}}'>",
	"<TablixBody>",
	"<TablixColumns>",
	"<TablixColumn>",
	"<Width>{{col_width}}</Width>",
	"<TablixColumn>",
	"</TablixColumns>",
	"<TablixRows>{{rows}}</TablixRow>",
	"</TablixBody>",
	"<DataSetName>{{data}}</DataSetName>",
	"<Style />",
	"</Tablix>"
]

var trow = [
	"<TablixRow>",
	"<Height>{{height}}</Height>",
	"<TablixCells>{{cells}}</TablixCells>"
	"</TablixRow>"
];

tcell = [
	"<TablixCell>",
	"<CellContents>{{content}}</CellContents>",
	"<TablixCell>"
];

textbox = [
	"<Textbox Name='{{Name}}'>",
	"<CanGrow>{{grow}}</CanGrow>",
	"<KeepTogether>{{together}}</KeepTogether>",
	"<Paragraphs>",
	"<TextRuns>",
	"<TextRun>",
	"<Value>{{value}}</Value>",
	"</TextRun>",
	"</TextRuns>",
	"</Paragraphs>",
	"<rd:DefaultName>{{name}}</rd:DefaultName>",
	"<Style>",
	"<Border>",
	"<Color>LightGrey</Color>",
	"<Style>Solid</Style>",
	"</Border>",
	"<PaddingLeft>2pt</PaddingLeft>",
	"<PaddingRight>2pt</PaddingRight>",
	"<PaddingTop>2pt</PaddingTop>",
	"<PaddingBottom>2pt</PaddingBottom>",
	"</Style>",
	"</Textbox>"
];

var defaults = {};

module.exports = function(options) {

	var settings = _.merge(defaults, options);

	var dsts = csvtojson.toObject(settings.dstlistpath).output;

	var header_row = dsts.map(function(dst) {
		return trow.join('\n').replace('{{height}}', settings.rowheight)
			.replace('{{cells}}', tcell.join('\n').replace('{{content}}',
					textbox.join('\n').replace('{{name}}', dst['Ref Name'])
						.replace('{{grow}}', 'True')
						.replace('{{together}}', 'True')
						.replace('{{value}}', dst['Ref Name'])
					)
			);
	})

	console.log(header_row);
};
