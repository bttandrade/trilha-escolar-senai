
function mostrarNotificacao(tipo, mensagem, titulo) {
    return Swal.fire({
        title: titulo,
        text: mensagem,
        icon: tipo,
        confirmButtonText: 'OK'
    }).then((result) => {
        return true;
    });
}

async function confirmNotificacao(mensagem,titulo,aprovado,negado) {
    const result = await Swal.fire({
        title: titulo,
        text: mensagem,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    })

    if (result.isConfirmed) {
        await Swal.fire({
            title: 'Aprovado!',
            text: aprovado,
            icon: 'success',
            confirmButtonText: 'OK'
        });
        return true;
    } else {
        await Swal.fire({
            title: 'Cancelado',
            text: negado,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return false;
    }
}
export { mostrarNotificacao, confirmNotificacao };