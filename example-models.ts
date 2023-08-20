export interface Campaign {
  readonly id: number;
  readonly start?: string;
  readonly end?: string;
  readonly name?: string;
  readonly description?: string;
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface ConnectedAccount {
  readonly id: number;
  readonly name: string;
  readonly stripe_connect_account_id: string;
  readonly published_at?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface CrowdednessHistory {
  readonly id: number;
  readonly place?: string;
  readonly crowdedness: 'many_seats_available' | 'few_seats_available' | 'full' | 'unset' | 'closed';
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface PaymentMethod {
  readonly id: number;
  readonly name?: string;
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface PlaceCategory {
  readonly id: number;
  readonly places?: readonly string[];
  readonly name: string;
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface PlaceManager {
  readonly id: number;
  readonly place?: string;
  readonly user?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface Place {
  readonly id: number;
  readonly category?: string;
  readonly photos?: readonly string[];
  readonly opening_hours?: readonly DefaultPlaceOpeningHoursPeriodComponent[];
  readonly opening_hours_note?: string;
  readonly website?: string;
  readonly phone_number?: string;
  readonly email?: string;
  readonly available_payment_methods?: readonly string[];
  readonly available_payment_methods_note?: string;
  readonly crowdedness_history?: readonly string[];
  readonly related_product_groups?: readonly string[];
  readonly position?: DefaultPositionComponent;
  readonly campaigns?: readonly DefaultPlaceCampaignComponent[];
  readonly manager?: string;
  readonly label?: string;
  readonly name: string;
  readonly description?: string;
  readonly zipcode?: string;
  readonly address?: string;
  readonly access?: string;
  readonly parking?: string;
  readonly ticket_molds?: readonly string[];
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface ProductGroupView {
  readonly id: number;
  readonly product_groups?: readonly string[];
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface ProductGroup {
  readonly id: number;
  readonly products?: readonly string[];
  readonly map_view: unknown;
  readonly related_places?: readonly string[];
  readonly name: string;
  readonly description?: string;
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface ProductTag {
  readonly id: number;
  readonly name: string;
  readonly hidden: boolean;
  readonly products?: readonly string[];
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface Product {
  readonly id: number;
  readonly available_from?: string;
  readonly available_to?: string;
  readonly ticket_molds?: readonly string[];
  readonly pricing_rule: DefaultPriceCalculatorComponent;
  readonly name: string;
  readonly description?: string;
  readonly product_group?: string;
  readonly refundable: boolean;
  readonly attrs?: readonly DefaultAttributeComponent[];
  readonly tags?: readonly string[];
  readonly confirmation_required: boolean;
  readonly payment_destination?: string;
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface TemplateEnvironment {
  readonly id: number;
  readonly global?: string;
  readonly locale_specific?: string;
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface TicketKind {
  readonly id: number;
  readonly label: string;
  readonly background_image?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface TicketMold {
  readonly id: number;
  readonly expires_at?: string;
  readonly valid_from?: string;
  readonly validity_duration?: string;
  readonly kind?: string;
  readonly name: string;
  readonly description: string;
  readonly redemption: DefaultTicketRedemptionComponent;
  readonly input_specs?: readonly DefaultInputSpecComponent[];
  readonly reservation_configuration?: DefaultReservationConfigurationComponent;
  readonly attrs?: readonly DefaultAttributeComponent[];
  readonly place?: string;
  readonly localizations?: readonly string[];
  readonly locale?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface CoreStore {
  readonly id: number;
  readonly key?: string;
  readonly value?: string;
  readonly type?: string;
  readonly environment?: string;
  readonly tag?: string;
}

export interface StrapiWebhooks {
  readonly id: number;
  readonly name?: string;
  readonly url?: string;
  readonly headers?: unknown;
  readonly events?: unknown;
  readonly enabled?: boolean;
}

export interface Locale {
  readonly id: number;
  readonly name?: string;
  readonly code?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface File {
  readonly id: number;
  readonly name: string;
  readonly alternativeText?: string;
  readonly caption?: string;
  readonly width?: number;
  readonly height?: number;
  readonly formats?: unknown;
  readonly hash: string;
  readonly ext?: string;
  readonly mime: string;
  readonly size: number;
  readonly url: string;
  readonly previewUrl?: string;
  readonly provider: string;
  readonly provider_metadata?: unknown;
  readonly related?: readonly string[];
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface Permission {
  readonly id: number;
  readonly type: string;
  readonly controller: string;
  readonly action: string;
  readonly enabled: boolean;
  readonly policy?: string;
  readonly role?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface Role {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly type?: string;
  readonly permissions?: readonly string[];
  readonly users?: readonly string[];
  readonly created_by?: string;
  readonly updated_by?: string;
}

export interface User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly provider?: string;
  readonly password?: string;
  readonly resetPasswordToken?: string;
  readonly confirmationToken?: string;
  readonly confirmed?: boolean;
  readonly blocked?: boolean;
  readonly role?: string;
  readonly created_by?: string;
  readonly updated_by?: string;
}

export type Model = Campaign | ConnectedAccount | CrowdednessHistory | PaymentMethod | PlaceCategory | PlaceManager | Place | ProductGroupView | ProductGroup | ProductTag | Product | TemplateEnvironment | TicketKind | TicketMold | CoreStore | StrapiWebhooks | Locale | File | Permission | Role | User;

export interface ModelByName {
  readonly 'campaign': Campaign;
  readonly 'connected-account': ConnectedAccount;
  readonly 'crowdedness-history': CrowdednessHistory;
  readonly 'payment-method': PaymentMethod;
  readonly 'place-category': PlaceCategory;
  readonly 'place-manager': PlaceManager;
  readonly 'place': Place;
  readonly 'product-group-view': ProductGroupView;
  readonly 'product-group': ProductGroup;
  readonly 'product-tag': ProductTag;
  readonly 'product': Product;
  readonly 'template-environment': TemplateEnvironment;
  readonly 'ticket-kind': TicketKind;
  readonly 'ticket-mold': TicketMold;
  readonly 'core_store': CoreStore;
  readonly 'strapi_webhooks': StrapiWebhooks;
  readonly 'locale': Locale;
  readonly 'file': File;
  readonly 'permission': Permission;
  readonly 'role': Role;
  readonly 'user': User;
}

export interface DefaultAttributeComponent {
  readonly name: string;
  readonly value?: string;
  readonly important: boolean;
}

export interface DefaultInputSpecComponent {
  readonly type: 'text' | 'number' | 'number_people' | 'date_reservation' | 'repeater';
  readonly name: DefaultMultilingualStringComponent;
  readonly description?: DefaultMultilingualStringComponent;
  readonly key: string;
  readonly configuration?: unknown;
}

export interface DefaultMultilingualRichTextComponent {
  readonly ja: string;
  readonly en?: string;
}

export interface DefaultMultilingualStringComponent {
  readonly en?: string;
  readonly ja: string;
}

export interface DefaultPlaceCampaignComponent {
  readonly campaign?: string;
  readonly description?: DefaultMultilingualRichTextComponent;
  readonly menu?: readonly DefaultPlaceMenuItemComponent[];
}

export interface DefaultPlaceMenuItemComponent {
  readonly price: number;
  readonly name_en?: string;
  readonly name_ja: string;
}

export interface DefaultPlaceOpeningHoursPeriodComponent {
  readonly open: DefaultPlaceOpeningHoursTimeComponent;
  readonly close?: DefaultPlaceOpeningHoursTimeComponent;
}

export interface DefaultPlaceOpeningHoursTimeComponent {
  readonly day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  readonly hours: number;
  readonly minutes: number;
}

export interface DefaultPositionComponent {
  readonly latitude: number;
  readonly longitude: number;
}

export interface DefaultPriceCalculatorComponent {
  readonly type: 'fixed' | 'fare_classes_with_quantity' | 'tl_lincoln';
  readonly configuration?: unknown;
}

export interface DefaultProductOptionComponent {
  readonly name: DefaultMultilingualStringComponent;
  readonly price: number;
  readonly ticket_molds?: readonly string[];
  readonly refund_fee: number;
}

export interface DefaultReservationConfigurationComponent {
  readonly type: 'tists' | 'reservation_cms_date' | 'tl_lincoln';
  readonly configuration?: unknown;
}

export interface DefaultTicketMoldInputComponent {
  readonly type: 'text' | 'number' | 'number_people' | 'date_reservation';
  readonly name: DefaultMultilingualStringComponent;
  readonly key: string;
}

export interface DefaultTicketRedemptionComponent {
  readonly type?: 'simple' | 'transportation';
  readonly configuration?: unknown;
}

export type Component = DefaultAttributeComponent | DefaultInputSpecComponent | DefaultMultilingualRichTextComponent | DefaultMultilingualStringComponent | DefaultPlaceCampaignComponent | DefaultPlaceMenuItemComponent | DefaultPlaceOpeningHoursPeriodComponent | DefaultPlaceOpeningHoursTimeComponent | DefaultPositionComponent | DefaultPriceCalculatorComponent | DefaultProductOptionComponent | DefaultReservationConfigurationComponent | DefaultTicketMoldInputComponent | DefaultTicketRedemptionComponent;
