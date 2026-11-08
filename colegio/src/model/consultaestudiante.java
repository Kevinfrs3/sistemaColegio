/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author LENOVO
 */
public class consultaestudiante {

    public static final List<estudiante> listaestudiante = new ArrayList<>();
    private final consultacurso consultaCurso = new consultacurso();

    public boolean agregarEstudiante(String identificacion, String nombre, String apellido, int edad) {
        if (identificacion == null || !identificacion.matches("\\d+") || nombre == null
                || !nombre.trim().matches("[\\p{L}\\s'-]+") || apellido == null
                || !apellido.trim().matches("[\\p{L}\\s'-]+") || edad < 0 || edad > 99
                || buscarEstudiante(identificacion) != null) {
            return false;
        }
        estudiante nuevoEstudiante = new estudiante();
        nuevoEstudiante.setIdentificacion(identificacion.trim());
        nuevoEstudiante.setNombre(nombre.trim());
        nuevoEstudiante.setApellido(apellido.trim());
        nuevoEstudiante.setEdad(edad);
        listaestudiante.add(nuevoEstudiante);
        return true;
    }

    public boolean editarEstudiante(String identificacion, String nombre, String apellido, int edad) {
        estudiante existente = buscarEstudiante(identificacion);
        if (existente == null || nombre == null || !nombre.trim().matches("[\\p{L}\\s'-]+")
                || apellido == null || !apellido.trim().matches("[\\p{L}\\s'-]+")
                || edad < 0 || edad > 99) {
            return false;
        }
        existente.setNombre(nombre.trim());
        existente.setApellido(apellido.trim());
        existente.setEdad(edad);
        return true;
    }

    public boolean eliminarEstudiante(String identificacion) {
        estudiante existente = buscarEstudiante(identificacion);
        return existente != null && listaestudiante.remove(existente);
    }

    public estudiante buscarEstudiante(String identificacion) {
        if (identificacion == null) {
            return null;
        }
        for (estudiante existente : listaestudiante) {
            if (existente.getIdentificacion().equalsIgnoreCase(identificacion.trim())) {
                return existente;
            }
        }
        return null;
    }

    public List<estudiante> consultarEstudiantes() {
        return new ArrayList<>(listaestudiante);
    }

    public boolean matricularcurso(int codigo, estudiante Estudiante) {
        if (Estudiante == null || consultaCurso.buscarCurso(codigo) == null
                || Estudiante.getCursosmatricula().contains(codigo)) {
            return false;
        }
        Estudiante.getCursosmatricula().add(codigo);
        return true;
    }

    public boolean editarmatriculacurso(int codigo, int codigoactual, estudiante Estudiante) {
        if (Estudiante == null || consultaCurso.buscarCurso(codigoactual) == null
                || Estudiante.getCursosmatricula().contains(codigoactual)) {
            return false;
        }
        int indice = Estudiante.getCursosmatricula().indexOf(codigo);
        if (indice < 0) {
            return false;
        }
        Estudiante.getCursosmatricula().set(indice, codigoactual);
        return true;
    }

    public boolean eliminarmatriculacurso(int codigo, estudiante Estudiante) {
        if (Estudiante == null) {
            return false;
        }
        return Estudiante.getCursosmatricula().remove(Integer.valueOf(codigo));
    }
}
