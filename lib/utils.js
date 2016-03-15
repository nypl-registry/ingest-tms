'use strict'

var objectsMapping = ['ObjectID', 'ObjectNumber', 'SortNumber', 'ObjectCount', 'DepartmentID', 'ObjectStatusID', 'ClassificationID', 'SubClassID', 'Type', 'LoanClassID', 'DateBegin', 'DateEnd', 'ObjectName', 'Dated', 'Title', 'Medium', 'Dimensions', 'Signed', 'Inscribed', 'Markings', 'CreditLine', 'Chat', 'DimensionRemarks', 'Description', 'Exhibitions', 'Provenance', 'PubReferences', 'Notes', 'CuratorialRemarks', 'RelatedWorks', 'Portfolio', 'ObjectHeightCMOLD', 'ObjectWidthCMOLD', 'ObjectDepthCMOLD', 'ObjectDiameterCMOLD', 'ObjectWeightKGOLD', 'PublicAccess', 'CuratorApproved', 'OnView', 'TextSearchID', 'LoginID', 'EnteredDate', 'Accountability', 'PaperFileRef', 'ObjectLevelID', 'ObjectTypeID', 'ObjectScreenID', 'UserNumber1', 'UserNumber2', 'UserNumber3', 'UserNumber4', 'ObjectNameID', 'ObjectNameAltID', 'UserDate1', 'UserDate2', 'UserDate3', 'UserDate4', 'State', 'CatRais', 'HistAttributions', 'Bibliography', 'Negative', 'LoanClass', 'Edition', 'Cataloguer', 'CatalogueDateOld', 'Curator', 'CuratorRevDateOld', 'PaperSupport', 'ObjectDiamCMOLD', 'SysTimeStamp', 'IsVirtual', 'CatalogueISODate', 'CuratorRevISODate', 'IsTemplate', 'ObjectNumber2', 'SortNumber2', 'DateRemarks', 'DateEffectiveISODate', 'PhysicalParentID', 'InJurisdiction']
var titleMapping = ['TitleID', 'ObjectID', 'TitleTypeID', 'Title', 'Remarks', 'Active', 'LoginID', 'EnteredDate', 'DisplayOrder', 'Displayed', 'LanguageID', 'SysTimeStamp', 'DateEffectiveISODate', 'IsExhTitle']
var consituentMapping = ['ConstituentID', 'ConstituentTypeID', 'Active', 'AlphaSort', 'LastName', 'FirstName', 'NameTitle', 'Institution', 'LastSoundEx', 'FirstSoundEx', 'InstitutionSoundEx', 'DisplayName', 'BeginDate', 'EndDate', 'DisplayDate', 'Biography', 'Code', 'Nationality', 'School', 'LoginID', 'EnteredDate', 'PublicAccessOld', 'Remarks', 'Position', 'MiddleName', 'Suffix', 'CultureGroup', 'SysTimeStamp', 'N_DisplayName', 'N_DisplayDate', 'salutation', 'Approved', 'PublicAccess', 'IsPrivate', 'DefaultNameID', 'SystemFlag', 'InternalStatus']
var objConXrefMapping = ['ConXrefID', 'ObjectID', 'ConstituentID', 'RoleID', 'DateBegin', 'DateEnd', 'Remarks', 'LoginID', 'EnteredDate', 'ConStatement', 'DisplayOrder', 'Displayed', 'Active', 'Prefix', 'Suffix', 'Amount', 'DisplayDate', 'Role']
var altNumMapping = ['AltNumID', 'ID', 'TableID', 'AltNum', 'Description', 'LoginID', 'EnteredDate', 'Remarks', 'BeginISODate', 'EndISODate']

// These methods all take the maps above and transfer the array numeric index brought over by the CSV parser into an object

exports.mapObjectCsvToJson = function (csvArray) {
  var result = {}
  for (var x in csvArray) {
    result[objectsMapping[x]] = csvArray[x]
  }
  return result
}

exports.mapTitleCsvToJson = function (csvArray) {
  var result = {}
  for (var x in csvArray) {
    result[titleMapping[x]] = csvArray[x]
  }
  return result
}

exports.mapConsituentCsvToJson = function (csvArray) {
  var result = {}
  for (var x in csvArray) {
    result[consituentMapping[x]] = csvArray[x]
  }
  return result
}

exports.mapObjConXrefCsvToJson = function (csvArray) {
  var result = {}
  for (var x in csvArray) {
    result[objConXrefMapping[x]] = csvArray[x]
  }
  return result
}

exports.mapAltNumCsvToJson = function (csvArray) {
  var result = {}
  for (var x in csvArray) {
    result[altNumMapping[x]] = csvArray[x]
  }
  return result
}
