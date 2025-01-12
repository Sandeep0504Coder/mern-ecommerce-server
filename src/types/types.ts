import { NextFunction, Request, Response } from "express";

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

export type SearchRequestQuery = {
    search?: string;
    price?: string;
    category?: string;
    sort?: string;
    page?: string;
}

export interface BaseQuery{
    name?: {
        $regex: string;
        $options: string;
    };
    price?: { $lte: number };
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