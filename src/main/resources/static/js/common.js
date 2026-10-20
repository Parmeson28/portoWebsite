// Password toggle (login page)
function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('bi-eye-slash', 'bi-eye');
    }
}

// Sidebar toggle (panel pages)
function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('backdrop')?.classList.toggle('open');
}

function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('backdrop')?.classList.remove('open');
}

// Scripts are loaded at the end of the body, after the page controls.
document.querySelector('.password-toggle')?.addEventListener('click', togglePassword);
document.querySelector('.hamburger')?.addEventListener('click', toggleSidebar);
document.getElementById('backdrop')?.addEventListener('click', closeSidebar);

// Editable product details preview (admin).
function initProductEditor() {
    if (!document.getElementById('productEditor')) return;

    const form = document.getElementById('productForm');
    const fields = {
        name: document.getElementById('productName'),
        description: document.getElementById('productDescription'),
        price: document.getElementById('productPrice'),
        available: document.getElementById('productAvailability'),
        whatsapp: document.getElementById('productWhatsapp')
    };
    const storageKey = 'portoMaquinas.productDraft.v1';
    const maxImages = 8;
    const maxFileSize = 2 * 1024 * 1024;
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const imageInput = document.getElementById('productImages');
    const imageUrl = document.getElementById('productImageUrl');
    const imageList = document.getElementById('productImageList');
    const thumbnails = document.getElementById('productImageThumbnails');
    const previewImage = document.getElementById('previewImage');
    const imageEmpty = document.getElementById('previewImageEmpty');
    const imageEmptyText = document.getElementById('previewImageEmptyText');
    const imageCounter = document.getElementById('previewImageCounter');
    const previousImage = document.getElementById('previousProductImage');
    const nextImage = document.getElementById('nextProductImage');
    const specFields = document.getElementById('productSpecFields');
    const saveMessage = document.getElementById('productSaveMessage');
    const imageMessage = document.getElementById('imageMessage');
    const saveButton = document.getElementById('saveProductDraft');
    const addImageButton = document.getElementById('addProductImage');
    let images = [];
    let currentImage = 0;
    let specSequence = 0;
    let dirty = false;
    let uploading = false;
    const failedImageSources = new Set();

    function setMessage(element, text, error = false) {
        element.textContent = text;
        element.hidden = !text;
        element.classList.toggle('product-message-error', error);
    }

    function isImageSource(source, allowData = false) {
        if (typeof source !== 'string') return false;
        if (allowData && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(source)) {
            return source.length <= Math.ceil(maxFileSize * 4 / 3) + 100;
        }
        if (source.length > 2048) return false;
        try {
            const url = new URL(source);
            return url.protocol === 'https:' || url.protocol === 'http:';
        } catch {
            return false;
        }
    }

    function readProduct() {
        return {
            name: fields.name.value.trim(), description: fields.description.value.trim(),
            price: fields.price.value, available: fields.available.value === 'true',
            whatsapp: fields.whatsapp.value.trim(), images,
            specifications: Array.from(specFields.querySelectorAll('.product-spec-row'), row => ({
                label: row.querySelector('.product-spec-key').value.trim(),
                value: row.querySelector('.product-spec-value').value.trim()
            }))
        };
    }

    function showImage() {
        const image = images[currentImage];
        const failed = image && failedImageSources.has(image.src);
        previewImage.hidden = !image || Boolean(failed);
        imageEmpty.hidden = Boolean(image) && !failed;
        imageEmptyText.textContent = failed ? 'Não foi possível carregar esta imagem. Confira o endereço ou escolha outra foto.' : 'Adicione imagens para visualizar o item.';
        if (image) {
            previewImage.alt = `${fields.name.value.trim() || 'Item'} — imagem ${currentImage + 1}`;
            if (previewImage.getAttribute('src') !== image.src) previewImage.src = image.src;
        } else {
            previewImage.removeAttribute('src');
            previewImage.alt = '';
        }
        imageCounter.textContent = image ? `${currentImage + 1} / ${images.length}` : '';
        imageCounter.hidden = !image;
        previousImage.hidden = images.length < 2;
        nextImage.hidden = images.length < 2;
        thumbnails.hidden = !images.length;
        thumbnails.querySelectorAll('button').forEach((button, index) => {
            button.classList.toggle('is-selected', index === currentImage);
            button.setAttribute('aria-pressed', String(index === currentImage));
        });
    }

    function updatePreview(markDirty = true) {
        const product = readProduct();
        const price = Number(product.price);
        const hasPrice = product.price !== '' && Number.isFinite(price) && price >= 0 && price <= 999999999.99;
        document.getElementById('previewName').textContent = product.name || 'Nome do item';
        document.getElementById('previewDescription').textContent = product.description || 'Adicione uma descrição para apresentar o item.';
        document.getElementById('previewPrice').textContent = hasPrice ? currency.format(price) : 'Preço a preencher';
        const availability = document.getElementById('previewAvailability');
        availability.textContent = product.available ? 'Disponível' : 'Indisponível';
        availability.classList.toggle('is-available', product.available);
        availability.classList.toggle('is-unavailable', !product.available);

        const specifications = document.getElementById('previewSpecifications');
        specifications.replaceChildren();
        product.specifications.filter(spec => spec.label && spec.value).forEach(spec => {
            const row = document.createElement('div');
            const label = document.createElement('dt');
            const value = document.createElement('dd');
            label.textContent = spec.label;
            value.textContent = spec.value;
            row.append(label, value);
            specifications.append(row);
        });
        document.getElementById('previewSpecsEmpty').hidden = Boolean(specifications.children.length);

        const phone = product.whatsapp.replace(/[\s()+.-]/g, '');
        const hasPhone = /^[1-9]\d{9,14}$/.test(phone);
        fields.whatsapp.setCustomValidity(product.whatsapp && !hasPhone ? 'Informe o DDI, DDD e número, com 10 a 15 dígitos.' : '');
        const whatsapp = document.getElementById('previewWhatsapp');
        whatsapp.classList.toggle('is-disabled', !hasPhone);
        whatsapp.setAttribute('aria-disabled', String(!hasPhone));
        whatsapp.tabIndex = hasPhone ? 0 : -1;
        document.getElementById('previewWhatsappText').textContent = product.available ? 'Tenho interesse' : 'Consultar disponibilidade';
        document.getElementById('previewWhatsappHelp').textContent = hasPhone ? 'Você será direcionado para uma conversa no WhatsApp.' : 'Adicione um número de WhatsApp válido para ativar o contato.';
        if (hasPhone) {
            const itemName = product.name || 'este item';
            const message = product.available
                ? `Olá! Tenho interesse no item ${itemName}${hasPrice ? ` (${currency.format(price)})` : ''}. Poderia me passar mais informações?`
                : `Olá! Gostaria de consultar a disponibilidade do item ${itemName}.`;
            whatsapp.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        } else {
            whatsapp.removeAttribute('href');
        }
        showImage();
        if (markDirty) {
            dirty = true;
            setMessage(saveMessage, 'Você tem alterações ainda não salvas.');
        }
    }
    function renderImages() {
        imageList.replaceChildren();
        thumbnails.replaceChildren();
        images.forEach((image, index) => {
            const row = document.createElement('li');
            const photo = document.createElement('img');
            photo.src = image.src;
            photo.alt = '';
            photo.className = 'product-upload-thumbnail';
            photo.addEventListener('error', () => { photo.hidden = true; }, { once: true });
            const name = document.createElement('span');
            name.className = 'product-upload-name';
            name.textContent = `${index === 0 ? 'Capa · ' : ''}${image.label}`;
            const actions = document.createElement('div');
            actions.className = 'product-image-actions';
            if (index > 0) {
                const cover = document.createElement('button');
                cover.type = 'button';
                cover.className = 'product-cover-button';
                cover.textContent = 'Usar como capa';
                cover.addEventListener('click', () => {
                    images.unshift(images.splice(index, 1)[0]);
                    currentImage = 0;
                    renderImages();
                    updatePreview();
                });
                actions.append(cover);
            }
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'product-icon-button';
            remove.textContent = '×';
            remove.setAttribute('aria-label', `Remover imagem ${index + 1}`);
            remove.addEventListener('click', () => {
                const removed = images.splice(index, 1)[0];
                failedImageSources.delete(removed.src);
                if (index < currentImage) currentImage--;
                currentImage = Math.max(0, Math.min(currentImage, images.length - 1));
                renderImages();
                updatePreview();
            });
            actions.append(remove);
            row.append(photo, name, actions);
            imageList.append(row);

            const thumbnail = document.createElement('button');
            thumbnail.type = 'button';
            thumbnail.setAttribute('aria-label', `Ver imagem ${index + 1}`);
            const thumbnailImage = document.createElement('img');
            thumbnailImage.src = image.src;
            thumbnailImage.alt = `Imagem ${index + 1}`;
            thumbnailImage.addEventListener('error', () => {
                thumbnailImage.hidden = true;
                thumbnail.textContent = String(index + 1);
            }, { once: true });
            thumbnail.append(thumbnailImage);
            thumbnail.addEventListener('click', () => {
                currentImage = index;
                showImage();
            });
            thumbnails.append(thumbnail);
        });
        showImage();
    }

    function addSpecification(spec = { label: '', value: '' }, focus = false) {
        if (specFields.children.length >= 20) {
            setMessage(saveMessage, 'Você pode adicionar até 20 informações técnicas.', true);
            return;
        }
        const row = document.getElementById('productSpecTemplate').content.firstElementChild.cloneNode(true);
        const key = row.querySelector('.product-spec-key');
        const value = row.querySelector('.product-spec-value');
        const sequence = ++specSequence;
        key.id = `productSpecKey${sequence}`;
        value.id = `productSpecValue${sequence}`;
        row.querySelector('.product-spec-label').htmlFor = key.id;
        row.querySelector('.product-spec-value-label').htmlFor = value.id;
        key.value = spec.label;
        value.value = spec.value;
        row.querySelector('.product-spec-remove').addEventListener('click', () => {
            row.remove();
            updatePreview();
            document.getElementById('addProductSpec').focus();
        });
        specFields.append(row);
        if (focus) {
            key.focus();
            updatePreview();
        }
    }
    addImageButton.addEventListener('click', () => {
        if (images.length >= maxImages) {
            setMessage(imageMessage, 'Você pode adicionar até 8 imagens.', true);
            return;
        }
        const source = imageUrl.value.trim();
        if (!isImageSource(source)) {
            setMessage(imageMessage, 'Informe um endereço completo de imagem começando com https:// ou http://.', true);
            imageUrl.focus();
            return;
        }
        images.push({ src: source, label: `Imagem ${images.length + 1}` });
        currentImage = images.length - 1;
        imageUrl.value = '';
        setMessage(imageMessage, 'Imagem adicionada.');
        renderImages();
        updatePreview();
    });

    imageInput.addEventListener('change', async () => {
        const files = Array.from(imageInput.files || []);
        if (!files.length) return;
        uploading = true;
        imageInput.disabled = true;
        addImageButton.disabled = true;
        saveButton.disabled = true;
        setMessage(imageMessage, 'Carregando imagens…');
        const errors = [];
        let added = 0;
        try {
            for (const file of files) {
                if (images.length >= maxImages) {
                    errors.push('Limite de 8 imagens atingido.');
                    break;
                }
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > maxFileSize) {
                    errors.push(`${file.name}: escolha JPG, PNG ou WebP de até 2 MB.`);
                    continue;
                }
                try {
                    const source = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = () => reject(new Error('Falha na leitura'));
                        reader.onabort = () => reject(new Error('Leitura cancelada'));
                        reader.readAsDataURL(file);
                    });
                    if (!isImageSource(source, true)) throw new Error('Formato inválido');
                    images.push({ src: source, label: file.name.slice(0, 120) });
                    added++;
                } catch {
                    errors.push(`Não foi possível ler ${file.name}.`);
                }
            }
            if (added) {
                renderImages();
                updatePreview();
            }
            setMessage(imageMessage, `${added ? `${added} imagem(ns) adicionada(s). ` : ''}${errors.join(' ')}`.trim(), Boolean(errors.length));
        } finally {
            uploading = false;
            imageInput.disabled = false;
            addImageButton.disabled = false;
            saveButton.disabled = false;
            imageInput.value = '';
        }
    });

    previewImage.addEventListener('error', () => {
        const image = images[currentImage];
        if (!image) return;
        failedImageSources.add(image.src);
        showImage();
    });
    function moveImage(direction) {
        if (!images.length) return;
        currentImage = (currentImage + direction + images.length) % images.length;
        showImage();
    }
    previousImage.addEventListener('click', () => moveImage(-1));
    nextImage.addEventListener('click', () => moveImage(1));
    document.getElementById('productCarousel').addEventListener('keydown', event => {
        if (images.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault();
            moveImage(event.key === 'ArrowLeft' ? -1 : 1);
        }
    });
    document.getElementById('addProductSpec').addEventListener('click', () => addSpecification(undefined, true));
    form.addEventListener('input', event => {
        if (event.target !== imageUrl && event.target !== imageInput) updatePreview();
    });
    form.addEventListener('change', event => {
        if (event.target === fields.available) updatePreview();
    });
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (uploading || !form.reportValidity()) return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, ...readProduct() }));
            dirty = false;
            setMessage(saveMessage, 'Rascunho salvo neste navegador. Você pode voltar para continuar a edição.');
        } catch {
            setMessage(saveMessage, 'Não foi possível salvar no navegador. Reduza as fotos, use endereços de imagem ou libere espaço e tente novamente.', true);
        }
    });
    window.addEventListener('beforeunload', event => {
        if (dirty || uploading) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
            const draft = JSON.parse(saved);
            if (draft.version !== 1) throw new Error('Versão inválida');
            fields.name.value = typeof draft.name === 'string' ? draft.name.slice(0, 120) : '';
            fields.description.value = typeof draft.description === 'string' ? draft.description.slice(0, 5000) : '';
            fields.price.value = typeof draft.price === 'string' && draft.price !== '' && Number.isFinite(Number(draft.price)) && Number(draft.price) >= 0 && Number(draft.price) <= 999999999.99 ? draft.price : '';
            fields.available.value = draft.available === false ? 'false' : 'true';
            fields.whatsapp.value = typeof draft.whatsapp === 'string' ? draft.whatsapp.slice(0, 25) : '';
            images = Array.isArray(draft.images) ? draft.images.filter(image => image && isImageSource(image.src, true)).slice(0, maxImages).map(image => ({
                src: image.src,
                label: typeof image.label === 'string' ? image.label.slice(0, 120) : 'Imagem do item'
            })) : [];
            if (Array.isArray(draft.specifications)) {
                draft.specifications.slice(0, 20).forEach(spec => {
                    if (spec && typeof spec.label === 'string' && typeof spec.value === 'string') {
                        addSpecification({ label: spec.label.slice(0, 80), value: spec.value.slice(0, 200) });
                    }
                });
            }
            setMessage(saveMessage, 'Rascunho recuperado deste navegador.');
        }
    } catch {
        setMessage(saveMessage, 'Não foi possível recuperar o rascunho. Você pode editar uma nova prévia.', true);
    }
    if (!specFields.children.length) addSpecification();
    renderImages();
    updatePreview(false);
}

initProductEditor();
