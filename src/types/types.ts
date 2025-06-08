import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";

export interface NewUserRequestBody {
    name: string;
    email: string;
    photo: string;
    gender: string;
    _id: string;
    dob: Date;
}

export type ControllerType = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export interface NewProductRequestBody {
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string;
    variants: string;
}

export type NewHomePageContentRequestBody = {
    promotionalText: string;
    productSections: string;
}

export type SearchRequestQuery = {
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    category?: string;
    sort?: string;
    page?: string;
}

export interface BaseQuery{
    name?: {
        $regex: string;
        $options: string;
    };
    price?: { $lte?: number, $gte?: number };
    category?: string;
}

export type invalidateCacheProps = {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
    userId?: string;
    orderId?: string;
    productIdArray?: string[];
}

export type OrderItemType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
    variant: {
        configuration: {
            key: string;
            value: string;
        }[];
        price: number;
        stock: number;
        _id: string;
    } | undefined;
}

export type ShippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
}

export interface NewOrderRequestBody{
    shippingInfo: ShippingInfoType;
    user: string;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    orderItems: OrderItemType[]
}

export type NewAddressRequestBody = ShippingInfoType & {
    name: string;
    primaryPhone: number;
    secondaryPhone: number;
    address2: string;
    isDefault: boolean;
}

export type CreateDeliveryRuleRequestBody = {
    ruleName: string;
    subtotalMinRange: number;
    subtotalMaxRange: number;
    amount: number;
    percentage: number;
    setDeliveryFeeTo: string;
}

export type CreateSystemSettingRequestBody = {
    settingCategory: string;
    settingName: string;
    settingUniqueName: string;
    settingValue: string;
    entityId?: string;
}

export type CreateCountryRequestBody = {
    countryName: string;
    countryAbbreviation: string;
}

export type Product = {
    name: string;
    photos: {
        public_id: string;
        url: string;
    }[];
    category: string;
    price: number;
    _id: mongoose.Types.ObjectId;
    variants: ProductVariantType[];
    stock: number;
}

export type ProductVariantType = {
    configuration: Configuration[];
    price: number;
    stock: number;
    _id?: mongoose.Types.ObjectId;
}

export interface Configuration {
    key: string;
    value: string;
}
interface Filter {
    key: string;
    value: string;
}
export type ProductSectionType = {
    _id: string;
    sectionLabel: string;
    filters: Filter[];
    products?: Product[]; // Optional since we'll add this dynamically
}

export type HomePageContentType = {
    _id: string;
    banners: {
      public_id: string;
      url: string;
      _id: string;
    }[];
    productSections: ProductSectionType[];
    promotionalText: string;
}