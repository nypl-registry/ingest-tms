'use strict'

function IngestTms () {
  /**
   * Load the tmsConsituentsLookup table
   *
   * @param  {function} cb - lookup table returned
   */
  this.tmsConsituentsLookup = require(`${__dirname}/lib/loadlookup`).tmsConsituentsLookup
  /**
   * Load the tmsTitlesLookup table
   *
   * @param  {function} cb - lookup table returned
   */
  this.tmsTitlesLookup = require(`${__dirname}/lib/loadlookup`).tmsTitlesLookup
  /**
   * Load the tmsAltNumLookup table
   *
   * @param  {function} cb - lookup table returned
   */
  this.tmsAltNumLookup = require(`${__dirname}/lib/loadlookup`).tmsAltNumLookup

  /**
   * Load the tmsObjConXrefLookup table
   *
   * @param  {function} cb - lookup table returned
   */
  this.tmsObjConXrefLookup = require(`${__dirname}/lib/loadlookup`).tmsObjConXrefLookup

  /**
   * Load the tmsDepartmentsLookup table
   *
   * @param  {function} cb - lookup table returned
   */
  this.tmsDepartmentsLookup = require(`${__dirname}/lib/loadlookup`).tmsDepartmentsLookup

  /**
   * Load the tmsClassificationLookup table
   *
   * @param  {function} cb - lookup table returned
   */
  this.tmsClassificationLookup = require(`${__dirname}/lib/loadlookup`).tmsClassificationLookup

  /**
   * Runs all the load methods async and results the results when done
   *
   * @param  {function} cb - lookup tables returned
   */
  this.asyncAllLookup = require(`${__dirname}/lib/loadlookup`).asyncAllLookup

  /**
   * The main ingest method
   *
   * @param  {function} cb - nothing returned
   */
  this.tmsObjectsIngest = require(`${__dirname}/lib/objects`).tmsObjectsIngest

/**
 * Ingest the Archives components
 *
 * @param  {function} cb - Nothing returned
 */
// this.ingestComponents = require(`${__dirname}/lib/components`)
}

module.exports = exports = new IngestTms()
