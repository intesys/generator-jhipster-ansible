# Ansible Jhipster Deploy

1. Install Ansible

2. Install required roles via ansible-galaxy

```bash
ansible-galaxy install -r requirements.yml
```

3. Set your custom shared configurations in `hosts/shared-vars.yml` and `hosts/shared-secrets.yml`.

4. Set per-environment configurations in `hosts/<env>/group_vars/<my-app>/vars.yml|vault.yml`.

4. Encrypt your secret variables and commit your changes

```
ansible-vault encrypt hosts/shared-secrets.yml hosts/<env>*/group_vars/<my-app>*/vault.yml
```

5. Deploy

```
ansible-playbook -u <myuser> -i hosts/<env> my-app-playbook.yml --ask-vault
```

### Install Ansible

### Install Ansible (Linux / MAC)

Follow the instruction on the official [Ansible documentation](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

### Install Ansible (Windows)

#### On Windows
Ansible does not work on windows but you can use Visual Studio Code + Windows Subsystem For Linux. 

Install [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) (eg. Ubuntu).

Install [Visual Studio Code](https://code.visualstudio.com/) and its [WSL Extension](https://code.visualstudio.com/docs/remote/wsl)

Open WSL from Windows Start menu button.

#### In the Linux Subsystem

Install Ansible following the instructions on the official [Ansible documentation](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html).

Install git

Clone this project and open it with visual studio.

`code /path/to/my/cloned/project`


### Useful VSCode Extension
- [VSCode Extension for Ansible](https://www.ansible.com/resources/webinars-training/using-new-vs-code-extension-for-ansible)
- [VSCode + Windows Subsystem for Linux] (https://code.visualstudio.com/docs/remote/wsl)
- [VSCode Ansible vault Extension](https://marketplace.visualstudio.com/items?itemName=dhoeric.ansible-vault)
