'use client'
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
//import { ProductService } from './service/ProductService';
import { ProductService } from '../../app/services/product.service';

interface Product {
    id: string;
    code: string;
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
    quantity: number;
    inventoryStatus: string;
    rating: number;
}

export default function VacationsHome() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        ProductService.getProductsMini().then(data => setProducts(data));
    }, []);

    return (
        <div className="card">
            <DataTable value={products} tableStyle={{ minWidth: '50rem' }}>
                <Column field="code" header="Periodo"></Column>
                <Column field="name" header="Tipo"></Column>
                <Column field="category" header="Inicio"></Column>
                <Column field="quantity" header="Fin"></Column>
                <Column field="days" header="Dias"></Column>
            </DataTable>
        </div>
    );
}