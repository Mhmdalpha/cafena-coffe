document.addEventListener('alpine:init', ()=> {
    Alpine.data('products', ()=> ({
        items: [
            {id:1, name:"Americano", img: 'menu-1.png', price: 15000 },
            {id:2, name:"Espreso", img: 'menu-2.png', price: 16000 },
            {id:3, name:"Coffe latte", img: 'menu-3.png', price: 17000 },
            {id:4, name:"Cappucino", img: 'menu-4.png', price: 14000 },
            {id:5, name:"Macchiato", img: 'menu-5.png', price: 18000 },
            {id:6, name:"Mocha", img: 'menu-6.png', price: 19000 },
        ]
    }));

    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {

            //cek apakah ada barang yang sama di cart
            const cartItem = this.items.find((item) => item.id === newItem.id)

            // jika belum ada maka cartnya kosong
            if(!cartItem) {

                this.items.push({...newItem, quantity: 1, total: newItem.price});
                this.quantity++;
                this.total += newItem.price;
                console.log(this.total);
            }else {
                //jika barang sudah ada apakah sama atau beda
                this.items = this.items.map((item) => {
                    //jika barang berbeda
                    if(item.id !== newItem.id) {
                        return item;
                    } else {
                        //jika barang sudah ada, tambah quantity dan totalnya;
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                })
            }
        },
        remove(id) {
            // ambil item yang mau diremove berdasarkan id
            const cartItem = this.items.find((item) => item.id === id)

            // jika barang item lebih dari satu 
            if(cartItem.quantity > 1) {
                // telusuri satu satu
                this.items = this.items.map((item) => {
                    //jika bukan barang yang di klik
                    if(item.id !== id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }
                })
            } else if (cartItem.quantity === 1){
                // jika baangnya sisa 1
                this.items = this.items.filter ((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;
            }
        }
    })
});


//form validation
const checkOutButton = document.querySelector('.checkout-button')
checkOutButton.disabled = true;

const form = document.querySelector('#checkoutForm');

form.addEventListener('keyup', function () {
    for (let i = 0; i < form.elements.length; i ++) {
        if (form.elements[i].value.length !== 0) {
            checkOutButton.classList.remove('disabled');
            checkOutButton.classList.add('disabled');
        } else {
            return false;
        }
    }

    checkOutButton.disabled = false;
    checkOutButton.classList.remove('disabled');
})

//kirim data ketika tombol checkout di klik
checkOutButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);
    // const message = formatMessage(objData)
    // window.open('http://wa.me/6299999999999999?text=' + encodeURIComponent(message));

    //minta transaction token menggunakan ajax / fetch
    try {
        const response = await fetch('api/placeOrder.php', {
            method: 'POST',
            body: data,
        });
        const token = await response.text();
        window.snap.pay(token);
        // console.log(token);
    } catch(err) {
        console.log(err.message)
    }


});

// format pesan message
const formatMessage = (obj) => {
    return `Data Customer
    Nama: ${obj.nama},
    email: ${obj.email},
    no HP: ${obj.phone}
   Data pesanan
     ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)})\n`
     )}
     Total: ${rupiah(obj.total)}
     Terima kasih.`;
}

//konversi ku usd
const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
};