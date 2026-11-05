/**
 * D77: display labels for role field policy keys, reusing the console's existing field labels
 * so the editor reads like the forms it governs. A key without an entry (the API's catalogue
 * grows with its DTOs) falls back to {@link humanizeField}.
 */
export const FIELD_POLICY_LABEL_KEYS: Record<string, string> = {
  // side
  'side.address': 'UI.COMMON.ADDRESS',
  'side.phone1': 'UI.COMMON.PHONE_1',
  'side.phone2': 'UI.COMMON.PHONE_2',
  'side.sysPhone': 'UI.SUBSCRIBER_CREATE.SYS_PHONE',
  'side.mobilePhone': 'UI.SUBSCRIBER_CREATE.MOBILE_PHONE',
  'side.comment': 'UI.SUBSCRIBERS.COL_COMMENT',
  'side.serialNumber': 'UI.SUBSCRIBERS.COL_SERIAL',
  'side.safePassword': 'UI.SUBSCRIBER_CREATE.SAFE_PASSWORD',
  'side.identityNo': 'UI.SUBSCRIBER_CREATE.IDENTITY_NO',
  'side.policeStationNo': 'UI.SUBSCRIBER_CREATE.POLICE_STATION_NO',
  'side.taxOffice': 'UI.DIRECTORY.FIELD_TAX_OFFICE',
  'side.taxNo': 'UI.DIRECTORY.FIELD_TAX_NO',
  'side.latitude': 'UI.SUBSCRIBER_CREATE.LATITUDE',
  'side.longitude': 'UI.SUBSCRIBER_CREATE.LONGITUDE',
  'side.timeZone': 'UI.SUBSCRIBER_CREATE.TIME_ZONE',
  'side.armType': 'UI.SUBSCRIBER_CREATE.ARM_TYPE',
  'side.timeoutDuration': 'UI.SUBSCRIBER_CREATE.TIMEOUT_MINUTES',
  'side.gprsTimeoutMinutes': 'UI.SUBSCRIBER_CREATE.GPRS_TIMEOUT_MINUTES',
  'side.gprsModule': 'UI.SUBSCRIBERS.COL_GPRS_MODULE',
  'side.ebsModulePort': 'UI.SUBSCRIBERS.COL_EBS_MODULE_PORT',
  'side.enableRemoteManagement': 'UI.SUBSCRIBER.FIELD_ENABLE_REMOTE_MGMT',
  'side.mobileNotification': 'UI.SUBSCRIBER.FIELD_MOBILE_NOTIFICATION',
  'side.customerId': 'UI.SUBSCRIBERS.COL_CUSTOMER',
  'side.dealerId': 'UI.SUBSCRIBERS.COL_DEALER',
  'side.installerId': 'UI.SUBSCRIBER_CREATE.INSTALLER',
  'side.brandId': 'UI.SUBSCRIBER_CREATE.BRAND',
  'side.modelId': 'UI.SUBSCRIBER_CREATE.MODEL',
  'side.protocolId': 'UI.SUBSCRIBER_CREATE.PROTOCOL',
  'side.cityId': 'UI.SUBSCRIBERS.COL_CITY',
  'side.districtId': 'UI.SUBSCRIBERS.COL_DISTRICT',
  'side.regionId': 'UI.SUBSCRIBER_CREATE.REGION',
  'side.accountTypeId': 'UI.SUBSCRIBERS.COL_ACCOUNT_TYPE',
  'side.businessSectorId': 'UI.SUBSCRIBERS.COL_BUSINESS_SECTOR',
  'side.sideTypeId': 'UI.SUBSCRIBERS.COL_SIDE_TYPE',
  'side.installDate': 'UI.SUBSCRIBER_CREATE.INSTALL_DATE',
  'side.startDate': 'UI.SUBSCRIBER_CREATE.START_DATE',
  'side.endDate': 'UI.SUBSCRIBER_CREATE.END_DATE',
  'side.passiveDate': 'UI.SUBSCRIBERS.COL_PASSIVE_DATE',
  'side.lastSignalDate': 'UI.COMMON.LAST_SIGNAL',
  'side.recordDateTime': 'UI.COMMON.RECORD_DATE',
  'side.active': 'UI.COMMON.ACTIVE',
  'side.isOpen': 'UI.SUBSCRIBERS.OPEN',
  'side.isOnline': 'UI.COMMON.ONLINE',
  'side.cloudAlarm': 'UI.SUBSCRIBERS.CLOUD',
  // sideContact
  'sideContact.phone1': 'UI.COMMON.PHONE_1',
  'sideContact.phone2': 'UI.COMMON.PHONE_2',
  'sideContact.phone3': 'UI.COMMON.PHONE_3',
  'sideContact.note': 'UI.COMMON.NOTE',
  'sideContact.password': 'UI.SUBSCRIBER_CREATE.SAFE_PASSWORD',
  // customer
  'customer.address': 'UI.DIRECTORY.FIELD_ADDRESS',
  'customer.cityId': 'UI.DIRECTORY.FIELD_CITY',
  'customer.phone1': 'UI.DIRECTORY.FIELD_PHONE1',
  'customer.phone2': 'UI.DIRECTORY.FIELD_PHONE2',
  'customer.email1': 'UI.DIRECTORY.FIELD_MAIL1',
  'customer.email2': 'UI.DIRECTORY.FIELD_MAIL2',
  'customer.taxOffice': 'UI.DIRECTORY.FIELD_TAX_OFFICE',
  'customer.taxNo': 'UI.DIRECTORY.FIELD_TAX_NO',
  'customer.timeZone': 'UI.DIRECTORY.FIELD_TIMEZONE',
  'customer.sideCount': 'UI.DIRECTORY.FIELD_SIDE_COUNT',
  // dealer
  'dealer.fullName': 'UI.DIRECTORY.FIELD_LEGAL_NAME',
  'dealer.address': 'UI.DIRECTORY.FIELD_ADDRESS',
  'dealer.regionId': 'UI.DIRECTORY.FIELD_REGION',
  'dealer.cityId': 'UI.DIRECTORY.FIELD_CITY',
  'dealer.contact1': 'UI.DIRECTORY.FIELD_CONTACT1',
  'dealer.contact2': 'UI.DIRECTORY.FIELD_CONTACT2',
  'dealer.onCallServiceNumber': 'UI.DIRECTORY.FIELD_DUTY_PHONE',
  'dealer.mail1': 'UI.DIRECTORY.FIELD_MAIL1',
  'dealer.mail2': 'UI.DIRECTORY.FIELD_MAIL2',
  'dealer.mail3': 'UI.DIRECTORY.FIELD_MAIL3',
  'dealer.taxOffice': 'UI.DIRECTORY.FIELD_TAX_OFFICE',
  'dealer.taxNo': 'UI.DIRECTORY.FIELD_TAX_NO',
  'dealer.enableSms': 'UI.DIRECTORY.FIELD_ENABLE_SMS',
  'dealer.enableEmail': 'UI.DIRECTORY.FIELD_ENABLE_EMAIL',
  'dealer.active': 'UI.COMMON.ACTIVE',
  'dealer.releatedDealerId': 'UI.DIRECTORY.FIELD_PARENT_DEALER',
  'dealer.recordDateTime': 'UI.COMMON.RECORD_DATE',
  // sideService
  'sideService.priority': 'UI.SERVICE.PRIORITY',
  'sideService.plannedDate': 'UI.SERVICE.PLANNED_DATE',
  'sideService.estimatedDurationMinutes': 'UI.SERVICE.ESTIMATED_MINUTES',
  'sideService.actualDurationMinutes': 'UI.SERVICE.ACTUAL_MINUTES',
  'sideService.statement': 'UI.SERVICE.STATEMENT',
  'sideService.serviceTypeId': 'UI.SERVICE.COL_TYPE',
  'sideService.servicePersonId': 'UI.SERVICE.COL_TECHNICIAN',
  'sideService.cancelReason': 'UI.SERVICE.CANCEL_REASON_PLACEHOLDER'
}

/** `accountTypeId` → `Account type id`: readable enough for a key the console has no label for. */
export function humanizeField(field: string): string {
  const words = field
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Entity → its section title key in the editor. */
export const FIELD_POLICY_ENTITY_KEYS: Record<string, string> = {
  side: 'UI.FIELD_POLICY.ENTITY_SIDE',
  sideContact: 'UI.FIELD_POLICY.ENTITY_SIDE_CONTACT',
  customer: 'UI.FIELD_POLICY.ENTITY_CUSTOMER',
  dealer: 'UI.FIELD_POLICY.ENTITY_DEALER',
  sideService: 'UI.FIELD_POLICY.ENTITY_SIDE_SERVICE'
}

export const FIELD_POLICY_ENTITY_ORDER = ['side', 'sideContact', 'customer', 'dealer', 'sideService']
