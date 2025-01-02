declare const axios:any;

document.addEventListener("DOMContentLoaded", async () => {
    const result = await axios.get("http://localhost:3000/api/v1/users");
    let htmlUsers = "<table><thead><td>Nombre</td><td>Apellido</td><td>Nombre usuario</td><td>Email</td><td>Actualizar</td><td>Eliminar</td></thead>";
    result.data.forEach((user:any)=>{htmlUsers += `<tr><td>${user.name}</td><td>${user.first_surname}</td><td>${user.userName}</td><td>${user.email}</td><td><button class="update-button" id="update-${user.id}">Editar</button></td><td><button class="delete-button" id="delete-${user.id}">Eliminar</button></td></tr>`});
    htmlUsers += "</table>";
    document.getElementById("users")!.innerHTML = htmlUsers;
 
    document.querySelectorAll(".delete-button").forEach((button)=>{
        button.addEventListener("click", async (e)=>{
            const id = (e.target as HTMLElement).id.split("-")[1];
            const result = await axios.delete(`http://localhost:3000/api/v1/users/${id}`);
            location.reload();
        })
    });

    document.querySelectorAll(".update-button").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const id = (e.target as HTMLElement).id.split("-")[1];
            const user = await axios.get(`http://localhost:3000/api/v1/users/${id}`).then((r: any) => r.data);
            
            const row = (e.target as HTMLElement).closest('tr')!;
            row.innerHTML = `
                <td colspan="6">
                    <form id="edit-form-${id}" class="edit-form">
                        <input type="text" name="userName" value="${user.userName}" required>
                        <input type="text" name="name" value="${user.name}" required>
                        <input type="text" name="first_surname" value="${user.first_surname}" required>
                        <input type="email" name="email" value="${user.email}" required>
                        <button type="submit">Guardar</button>
                        <button type="button" onclick="location.reload()">Cancelar</button>
                    </form>
                </td>
            `;

            document.getElementById(`edit-form-${id}`)?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const userData = Object.fromEntries(formData);

                await axios.put(`http://localhost:3000/api/v1/users/${id}`, userData);
                location.reload();
            });
        });
    });
});