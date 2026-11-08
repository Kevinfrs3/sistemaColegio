package view;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import javax.swing.BorderFactory;
import javax.swing.DefaultListCellRenderer;
import javax.swing.JComboBox;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.RowFilter;
import javax.swing.JSpinner;
import javax.swing.JTabbedPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.SpinnerDateModel;
import javax.swing.UIManager;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.JTableHeader;
import javax.swing.table.TableRowSorter;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.text.AbstractDocument;
import javax.swing.text.AttributeSet;
import javax.swing.text.BadLocationException;
import javax.swing.text.DocumentFilter;
import java.util.regex.Pattern;
import model.consultacurso;
import model.consultaestudiante;
import model.consultaprofesor;
import model.curso;

public class inicio extends JFrame {

    private final consultacurso cursos = new consultacurso();
    private final consultaestudiante estudiantes = new consultaestudiante();
    private final consultaprofesor profesores = new consultaprofesor();
    private final DefaultTableModel modeloCursos = crearModelo("Código", "Nombre");
    private final DefaultTableModel modeloEstudiantes =
            crearModelo("Identificación", "Nombre", "Apellido", "Edad", "Cursos");
    private final DefaultTableModel modeloProfesores =
            crearModelo("Identificación", "Nombre", "Apellido", "Edad", "Cursos");
    private final DefaultTableModel modeloResumen =
            crearModelo("Identificación", "Estudiante", "Curso", "Profesor");
    private final JTable tablaCursos = new JTable(modeloCursos);
    private final JTable tablaEstudiantes = new JTable(modeloEstudiantes);
    private final JTable tablaProfesores = new JTable(modeloProfesores);
    private final JTable tablaResumen = new JTable(modeloResumen);

    public inicio() {
        super("Sistema de gestión escolar");
        aplicarTema();
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(880, 560);
        setMinimumSize(new Dimension(700, 420));
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        JPanel encabezado = crearEncabezado();
        add(encabezado, BorderLayout.NORTH);

        configurarTabla(tablaCursos);
        configurarTabla(tablaEstudiantes);
        configurarTabla(tablaProfesores);
        configurarTabla(tablaResumen);

        JTabbedPane pestanas = new JTabbedPane();
        pestanas.setBackground(new Color(241, 245, 250));
        pestanas.setForeground(new Color(37, 57, 79));
        pestanas.setFont(new Font("Segoe UI", Font.BOLD, 13));
        pestanas.addTab("Resumen", crearPanelResumen());
        pestanas.addTab("Cursos", crearPanelCursos());
        pestanas.addTab("Estudiantes", crearPanelPersonas(true));
        pestanas.addTab("Profesores", crearPanelPersonas(false));
        add(pestanas, BorderLayout.CENTER);

        actualizarCursos();
        actualizarPersonas(true);
        actualizarPersonas(false);
        actualizarResumen();
    }

    private void aplicarTema() {
        try {
            for (javax.swing.UIManager.LookAndFeelInfo info : javax.swing.UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    javax.swing.UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (Exception ex) {
            java.util.logging.Logger.getLogger(inicio.class.getName()).log(java.util.logging.Level.WARNING, null, ex);
        }

        UIManager.put("Panel.background", new Color(244, 247, 251));
        UIManager.put("ScrollPane.background", new Color(244, 247, 251));
        UIManager.put("TabbedPane.background", new Color(240, 243, 247));
        UIManager.put("TabbedPane.selected", new Color(255, 255, 255));
        UIManager.put("TabbedPane.foreground", new Color(34, 52, 72));
        UIManager.put("Button.background", new Color(79, 115, 255));
        UIManager.put("Button.foreground", Color.WHITE);
        UIManager.put("Button.focus", new Color(79, 115, 255));
        UIManager.put("Button.font", new Font("Segoe UI", Font.BOLD, 12));
        UIManager.put("TextField.background", Color.WHITE);
        UIManager.put("TextField.border", BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(190, 202, 220), 1),
                BorderFactory.createEmptyBorder(6, 8, 6, 8)));
        UIManager.put("ComboBox.background", Color.WHITE);
        UIManager.put("Table.background", Color.WHITE);
        UIManager.put("Table.alternateRowColor", new Color(246, 248, 252));
        UIManager.put("Table.selectionBackground", new Color(99, 142, 255));
        UIManager.put("Table.selectionForeground", Color.WHITE);
        UIManager.put("Table.gridColor", new Color(220, 226, 237));
        UIManager.put("TableHeader.background", new Color(31, 79, 142));
        UIManager.put("TableHeader.foreground", Color.WHITE);
        UIManager.put("OptionPane.background", new Color(244, 247, 251));
        UIManager.put("OptionPane.messageForeground", new Color(39, 57, 75));
    }

    private JPanel crearEncabezado() {
        JPanel encabezado = new JPanel(new BorderLayout(20, 10));
        encabezado.setBackground(new Color(25, 78, 144));
        encabezado.setBorder(BorderFactory.createEmptyBorder(18, 22, 18, 22));

        JLabel titulo = new JLabel("Sistema de gestión escolar");
        titulo.setFont(new Font("Segoe UI", Font.BOLD, 28));
        titulo.setForeground(Color.WHITE);

        JLabel descripcion = new JLabel("Gestión de cursos, estudiantes y profesores");
        descripcion.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        descripcion.setForeground(new Color(216, 229, 255));

        JPanel textos = new JPanel(new GridLayout(2, 1));
        textos.setOpaque(false);
        textos.add(titulo);
        textos.add(descripcion);

        JButton botonAccion = new JButton("Actualizar");
        botonAccion.setFocusPainted(false);
        botonAccion.setCursor(new Cursor(Cursor.HAND_CURSOR));
        botonAccion.setBackground(new Color(135, 171, 255));
        botonAccion.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(176, 202, 255), 1),
                BorderFactory.createEmptyBorder(8, 16, 8, 16)));
        botonAccion.addActionListener(evento -> {
            actualizarCursos();
            actualizarPersonas(true);
            actualizarPersonas(false);
        });

        encabezado.add(textos, BorderLayout.WEST);
        encabezado.add(botonAccion, BorderLayout.EAST);
        return encabezado;
    }

    private void configurarTabla(JTable tabla) {
        tabla.setRowHeight(28);
        tabla.setFillsViewportHeight(true);
        tabla.setSelectionMode(javax.swing.ListSelectionModel.SINGLE_SELECTION);
        tabla.setSelectionBackground(new Color(95, 141, 255));
        tabla.setSelectionForeground(Color.WHITE);
        tabla.setGridColor(new Color(220, 226, 233));
        tabla.setShowVerticalLines(false);
        tabla.setAutoCreateRowSorter(true);
        tabla.setFont(new Font("Segoe UI", Font.PLAIN, 12));

        JTableHeader encabezado = tabla.getTableHeader();
        encabezado.setBackground(new Color(31, 79, 142));
        encabezado.setForeground(Color.WHITE);
        encabezado.setFont(new Font("Segoe UI", Font.BOLD, 12));
        encabezado.setPreferredSize(new Dimension(100, 34));

        DefaultTableCellRenderer renderizador = new DefaultTableCellRenderer();
        renderizador.setHorizontalAlignment(JLabel.CENTER);
        tabla.setDefaultRenderer(Object.class, renderizador);
    }

    private JPanel crearPanelResumen() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(new Color(244, 247, 251));
        panel.setBorder(javax.swing.BorderFactory.createEmptyBorder(10, 10, 10, 10));

        panel.add(crearBarraBusqueda(tablaResumen), BorderLayout.NORTH);
        JScrollPane contenedor = new JScrollPane(tablaResumen);
        contenedor.setBorder(BorderFactory.createEmptyBorder());
        panel.add(contenedor, BorderLayout.CENTER);

        return panel;
    }

    private JPanel crearPanelCursos() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(new Color(244, 247, 251));
        panel.setBorder(javax.swing.BorderFactory.createEmptyBorder(10, 10, 10, 10));

        panel.add(crearBarraBusqueda(tablaCursos), BorderLayout.NORTH);
        JScrollPane contenedor = new JScrollPane(tablaCursos);
        contenedor.setBorder(BorderFactory.createEmptyBorder());
        panel.add(contenedor, BorderLayout.CENTER);

        JPanel botones = new JPanel(new FlowLayout(FlowLayout.LEADING, 10, 8));
        botones.setBackground(new Color(244, 247, 251));
        botones.add(crearBoton("Agregar", this::agregarCurso));
        botones.add(crearBoton("Editar nombre", this::editarCurso));
        botones.add(crearBoton("Eliminar", this::eliminarCurso));
        panel.add(botones, BorderLayout.SOUTH);
        return panel;
    }

    private JPanel crearPanelPersonas(boolean esEstudiante) {
        JTable tabla = esEstudiante ? tablaEstudiantes : tablaProfesores;
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(new Color(244, 247, 251));
        panel.setBorder(javax.swing.BorderFactory.createEmptyBorder(10, 10, 10, 10));

        panel.add(crearBarraBusqueda(tabla), BorderLayout.NORTH);
        JScrollPane contenedor = new JScrollPane(tabla);
        contenedor.setBorder(BorderFactory.createEmptyBorder());
        panel.add(contenedor, BorderLayout.CENTER);

        JPanel botones = new JPanel(new FlowLayout(FlowLayout.LEADING, 10, 8));
        botones.setBackground(new Color(244, 247, 251));
        botones.add(crearBoton("Agregar", () -> agregarPersona(esEstudiante)));
        botones.add(crearBoton("Editar", () -> editarPersona(esEstudiante)));
        botones.add(crearBoton("Eliminar", () -> eliminarPersona(esEstudiante)));
        botones.add(crearBoton("Asignar curso", () -> cambiarAsignacion(esEstudiante, true)));
        botones.add(crearBoton("Quitar curso", () -> cambiarAsignacion(esEstudiante, false)));
        panel.add(botones, BorderLayout.SOUTH);
        return panel;
    }

    private JPanel crearBarraBusqueda(JTable tabla) {
        JPanel barra = new JPanel(new FlowLayout(FlowLayout.LEADING, 8, 4));
        barra.setBackground(new Color(244, 247, 251));

        JLabel etiqueta = new JLabel("Buscar:");
        etiqueta.setFont(new Font("Segoe UI", Font.BOLD, 12));
        etiqueta.setForeground(new Color(52, 73, 94));

        JTextField busqueda = new JTextField(22);
        busqueda.setToolTipText("Filtra la tabla mientras escribes");
        TableRowSorter<DefaultTableModel> ordenador =
                new TableRowSorter<>((DefaultTableModel) tabla.getModel());
        tabla.setRowSorter(ordenador);
        busqueda.getDocument().addDocumentListener(new DocumentListener() {
            private void filtrar() {
                String texto = busqueda.getText().trim();
                ordenador.setRowFilter(texto.isEmpty()
                        ? null
                        : RowFilter.regexFilter("(?i)" + Pattern.quote(texto)));
            }

            @Override
            public void insertUpdate(DocumentEvent evento) {
                filtrar();
            }

            @Override
            public void removeUpdate(DocumentEvent evento) {
                filtrar();
            }

            @Override
            public void changedUpdate(DocumentEvent evento) {
                filtrar();
            }
        });

        JButton limpiar = new JButton("Limpiar");
        limpiar.setFocusPainted(false);
        limpiar.setCursor(new Cursor(Cursor.HAND_CURSOR));
        limpiar.addActionListener(evento -> busqueda.setText(""));

        barra.add(etiqueta);
        barra.add(busqueda);
        barra.add(limpiar);
        return barra;
    }

    private JButton crearBoton(String texto, Runnable accion) {
        JButton boton = new JButton(texto);
        boton.setFocusPainted(false);
        boton.setCursor(new Cursor(Cursor.HAND_CURSOR));
        boton.setBackground(new Color(79, 115, 255));
        boton.setForeground(Color.WHITE);
        boton.setOpaque(true);
        boton.setRolloverEnabled(true);
        boton.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(107, 138, 255), 1),
                BorderFactory.createEmptyBorder(8, 14, 8, 14)));
        boton.addMouseListener(new java.awt.event.MouseAdapter() {
            @Override
            public void mouseEntered(java.awt.event.MouseEvent evento) {
                boton.setBackground(new Color(54, 91, 225));
            }

            @Override
            public void mouseExited(java.awt.event.MouseEvent evento) {
                boton.setBackground(new Color(79, 115, 255));
            }
        });
        boton.addActionListener(evento -> accion.run());
        return boton;
    }

    private static DefaultTableModel crearModelo(String... columnas) {
        return new DefaultTableModel(columnas, 0) {
            @Override
            public boolean isCellEditable(int fila, int columna) {
                return false;
            }
        };
    }

    private void actualizarCursos() {
        modeloCursos.setRowCount(0);
        for (curso curso : cursos.consultarListaCurso()) {
            modeloCursos.addRow(new Object[]{curso.getCodigo(), curso.getNombre()});
        }
        actualizarResumen();
    }

    private void actualizarPersonas(boolean esEstudiante) {
        DefaultTableModel modelo = esEstudiante ? modeloEstudiantes : modeloProfesores;
        modelo.setRowCount(0);
        if (esEstudiante) {
            for (model.estudiante estudiante : estudiantes.consultarEstudiantes()) {
                modelo.addRow(new Object[]{
                    estudiante.getIdentificacion(), estudiante.getNombre(),
                    estudiante.getApellido(), estudiante.getEdad(), obtenerCursosComoTexto(estudiante.getCursosmatricula())
                });
            }
        } else {
            for (model.profesor profesor : profesores.consultarProfesores()) {
                modelo.addRow(new Object[]{
                    profesor.getIdentificacion(), profesor.getNombre(),
                    profesor.getApellido(), profesor.getEdad(), obtenerCursosComoTexto(profesor.getCursomatriculado())
                });
            }
        }
        actualizarResumen();
    }

    private void actualizarResumen() {
        modeloResumen.setRowCount(0);
        for (model.estudiante estudiante : estudiantes.consultarEstudiantes()) {
            String cursoTexto = obtenerCursosComoTexto(estudiante.getCursosmatricula());
            String profesorTexto = "Sin profesor";
            if (!estudiante.getCursosmatricula().isEmpty()) {
                profesorTexto = buscarProfesorPorCurso(estudiante.getCursosmatricula().get(0));
            }
            modeloResumen.addRow(new Object[]{
                estudiante.getIdentificacion(),
                estudiante.getNombre() + " " + estudiante.getApellido(),
                cursoTexto,
                profesorTexto
            });
        }
    }

    private String obtenerCursosComoTexto(List<Integer> codigos) {
        if (codigos == null || codigos.isEmpty()) {
            return "Sin curso";
        }
        StringBuilder texto = new StringBuilder();
        for (int i = 0; i < codigos.size(); i++) {
            if (i > 0) {
                texto.append(", ");
            }
            curso cursoActual = cursos.buscarCurso(codigos.get(i));
            if (cursoActual != null) {
                texto.append(cursoActual.getCodigo()).append(" - ").append(cursoActual.getNombre());
            } else {
                texto.append(codigos.get(i));
            }
        }
        return texto.toString();
    }

    private String buscarProfesorPorCurso(int codigoCurso) {
        for (model.profesor profesor : profesores.consultarProfesores()) {
            if (profesor.getCursomatriculado().contains(codigoCurso)) {
                return profesor.getNombre() + " " + profesor.getApellido();
            }
        }
        return "Sin profesor";
    }

    private void agregarCurso() {
        JTextField codigo = new JTextField();
        JTextField nombre = new JTextField();
        JPanel formulario = crearFormulario(new String[]{"Código", "Nombre"}, codigo, nombre);
        if (JOptionPane.showConfirmDialog(this, formulario, "Agregar curso",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE) != JOptionPane.OK_OPTION) {
            return;
        }
        try {
            int codigoCurso = Integer.parseInt(codigo.getText().trim());
            if (!cursos.agregarcurso(codigoCurso, nombre.getText())) {
                mostrarError("El código debe ser positivo y único, y el nombre no puede estar vacío.");
                return;
            }
            actualizarCursos();
        } catch (NumberFormatException ex) {
            mostrarError("Escribe un código de curso válido.");
        }
    }

    private void editarCurso() {
        int fila = tablaCursos.getSelectedRow();
        if (fila < 0) {
            mostrarError("Selecciona el curso que quieres editar.");
            return;
        }
        fila = tablaCursos.convertRowIndexToModel(fila);
        int codigo = ((Number) modeloCursos.getValueAt(fila, 0)).intValue();
        String nombreActual = (String) modeloCursos.getValueAt(fila, 1);
        String nombre = JOptionPane.showInputDialog(this, "Nombre del curso:", nombreActual);
        if (nombre == null) {
            return;
        }
        if (!cursos.editarcurso(codigo, nombre)) {
            mostrarError("El nombre del curso no puede estar vacío.");
            return;
        }
        actualizarCursos();
    }

    private void eliminarCurso() {
        int fila = tablaCursos.getSelectedRow();
        if (fila < 0) {
            mostrarError("Selecciona el curso que quieres eliminar.");
            return;
        }
        fila = tablaCursos.convertRowIndexToModel(fila);
        int codigo = ((Number) modeloCursos.getValueAt(fila, 0)).intValue();
        if (JOptionPane.showConfirmDialog(this, "¿Eliminar el curso seleccionado?",
                "Confirmar eliminación", JOptionPane.YES_NO_OPTION) != JOptionPane.YES_OPTION) {
            return;
        }
        if (!cursos.eliminarcurso(codigo)) {
            mostrarError("No se puede eliminar el curso porque todavía está asignado.");
            return;
        }
        actualizarCursos();
        actualizarPersonas(true);
        actualizarPersonas(false);
    }

    private void agregarPersona(boolean esEstudiante) {
        DatosPersona datos = solicitarDatosPersona("Agregar " + (esEstudiante ? "estudiante" : "profesor"), null);
        if (datos == null) {
            return;
        }
        if (!validarDatosPersona(datos)) {
            mostrarError("Completa todos los campos antes de guardar.");
            return;
        }
        boolean agregado = esEstudiante
                ? estudiantes.agregarEstudiante(datos.identificacion, datos.nombre, datos.apellido, datos.edad)
                : profesores.agregarProfesor(datos.identificacion, datos.nombre, datos.apellido, datos.edad);
        if (!agregado) {
            mostrarError("Verifica los datos: la identificación debe ser única y todos los campos son obligatorios.");
            return;
        }
        actualizarPersonas(esEstudiante);
    }

    private void editarPersona(boolean esEstudiante) {
        JTable tabla = esEstudiante ? tablaEstudiantes : tablaProfesores;
        int fila = tabla.getSelectedRow();
        if (fila < 0) {
            mostrarError("Selecciona el registro que quieres editar.");
            return;
        }
        fila = tabla.convertRowIndexToModel(fila);
        String identificacion = (String) tabla.getValueAt(fila, 0);
        DatosPersona inicial = new DatosPersona(
                identificacion,
                (String) tabla.getValueAt(fila, 1),
                (String) tabla.getValueAt(fila, 2),
                ((Number) tabla.getValueAt(fila, 3)).intValue());
        DatosPersona datos = solicitarDatosPersona("Editar registro", inicial);
        if (datos == null) {
            return;
        }
        if (!validarDatosPersona(datos)) {
            mostrarError("Completa todos los campos antes de guardar.");
            return;
        }
        boolean editado = esEstudiante
                ? estudiantes.editarEstudiante(identificacion, datos.nombre, datos.apellido, datos.edad)
                : profesores.editarProfesor(identificacion, datos.nombre, datos.apellido, datos.edad);
        if (!editado) {
            mostrarError("El nombre, apellido y edad deben ser válidos.");
            return;
        }
        actualizarPersonas(esEstudiante);
    }

    private void eliminarPersona(boolean esEstudiante) {
        JTable tabla = esEstudiante ? tablaEstudiantes : tablaProfesores;
        int fila = tabla.getSelectedRow();
        if (fila < 0) {
            mostrarError("Selecciona el registro que quieres eliminar.");
            return;
        }
        fila = tabla.convertRowIndexToModel(fila);
        String identificacion = (String) tabla.getValueAt(fila, 0);
        if (JOptionPane.showConfirmDialog(this, "¿Eliminar el registro seleccionado?",
                "Confirmar eliminación", JOptionPane.YES_NO_OPTION) != JOptionPane.YES_OPTION) {
            return;
        }
        boolean eliminado = esEstudiante
                ? estudiantes.eliminarEstudiante(identificacion)
                : profesores.eliminarProfesor(identificacion);
        if (!eliminado) {
            mostrarError("No se pudo eliminar el registro.");
            return;
        }
        actualizarPersonas(esEstudiante);
    }

    private void cambiarAsignacion(boolean esEstudiante, boolean asignar) {
        JTable tabla = esEstudiante ? tablaEstudiantes : tablaProfesores;
        int fila = tabla.getSelectedRow();
        if (fila < 0) {
            mostrarError("Selecciona primero un estudiante o profesor.");
            return;
        }
        fila = tabla.convertRowIndexToModel(fila);
        List<curso> listaCursos = cursos.consultarListaCurso();
        if (listaCursos.isEmpty()) {
            mostrarError("Primero agrega al menos un curso.");
            return;
        }
        JComboBox<curso> selector = new JComboBox<>(listaCursos.toArray(new curso[0]));
        selector.setRenderer(new DefaultListCellRenderer() {
            @Override
            public java.awt.Component getListCellRendererComponent(
                    javax.swing.JList<?> lista, Object valor, int indice,
                    boolean seleccionado, boolean enfocado) {
                super.getListCellRendererComponent(lista, valor, indice, seleccionado, enfocado);
                if (valor instanceof curso cursoSeleccionado) {
                    setText(cursoSeleccionado.getCodigo() + " - " + cursoSeleccionado.getNombre());
                }
                return this;
            }
        });
        String accion = asignar ? "Asignar curso" : "Quitar curso";
        if (JOptionPane.showConfirmDialog(this, selector, accion,
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE) != JOptionPane.OK_OPTION) {
            return;
        }
        curso cursoSeleccionado = (curso) selector.getSelectedItem();
        if (cursoSeleccionado == null) {
            return;
        }
        String identificacion = (String) tabla.getValueAt(fila, 0);
        boolean resultado;
        if (esEstudiante) {
            model.estudiante estudiante = estudiantes.buscarEstudiante(identificacion);
            resultado = asignar
                    ? estudiantes.matricularcurso(cursoSeleccionado.getCodigo(), estudiante)
                    : estudiantes.eliminarmatriculacurso(cursoSeleccionado.getCodigo(), estudiante);
        } else {
            model.profesor profesor = profesores.buscarProfesor(identificacion);
            resultado = asignar
                    ? profesores.matricularcurso(cursoSeleccionado.getCodigo(), profesor)
                    : profesores.eliminarmatriculacurso(cursoSeleccionado.getCodigo(), profesor);
        }
        if (!resultado) {
            mostrarError(asignar
                    ? (esEstudiante
                            ? "El curso ya está asignado o no se pudo realizar la asignación."
                            : "Ese curso ya está asignado a otro profesor.")
                    : "La persona no tiene asignado ese curso.");
            return;
        }
        actualizarPersonas(esEstudiante);
    }

    private DatosPersona solicitarDatosPersona(String titulo, DatosPersona inicial) {
        while (true) {
            JTextField identificacion = new JTextField(inicial == null ? "" : inicial.identificacion);
            JTextField nombre = new JTextField(inicial == null ? "" : inicial.nombre);
            JTextField apellido = new JTextField(inicial == null ? "" : inicial.apellido);
            aplicarFiltroSoloNumeros(identificacion);
            aplicarFiltroSoloLetras(nombre);
            aplicarFiltroSoloLetras(apellido);

            Date fechaInicial = inicial == null ? calcularFechaDesdeEdad(18) : calcularFechaDesdeEdad(inicial.edad);
            JSpinner fechaNacimiento = crearCalendario(fechaInicial);
            identificacion.setEnabled(inicial == null);

            JPanel formulario = new JPanel(new GridLayout(0, 2, 8, 8));
            formulario.add(new JLabel("Identificación:"));
            formulario.add(identificacion);
            formulario.add(new JLabel("Nombre:"));
            formulario.add(nombre);
            formulario.add(new JLabel("Apellido:"));
            formulario.add(apellido);
            formulario.add(new JLabel("Fecha de nacimiento:"));
            formulario.add(fechaNacimiento);

            int opcion = JOptionPane.showConfirmDialog(this, formulario, titulo,
                    JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
            if (opcion != JOptionPane.OK_OPTION) {
                return null;
            }

            int edad = calcularEdad((Date) fechaNacimiento.getValue());
            DatosPersona datos = new DatosPersona(
                    identificacion.getText().trim(),
                    nombre.getText().trim(),
                    apellido.getText().trim(),
                    edad);
            if (validarDatosPersona(datos)) {
                return datos;
            }

            mostrarError("Todos los campos son obligatorios y la fecha de nacimiento debe ser válida. Edad permitida: 0 a 99 años.");
        }
    }

    private JSpinner crearCalendario(Date fechaInicial) {
        SpinnerDateModel modelo = new SpinnerDateModel(fechaInicial, null, null, Calendar.DAY_OF_YEAR);
        JSpinner calendarioSpinner = new JSpinner(modelo);
        calendarioSpinner.setEditor(new JSpinner.DateEditor(calendarioSpinner, "dd/MM/yyyy"));
        return calendarioSpinner;
    }

    private void aplicarFiltroSoloLetras(JTextField campo) {
        if (campo.getDocument() instanceof AbstractDocument documento) {
            documento.setDocumentFilter(new DocumentFilter() {
                @Override
                public void replace(FilterBypass fb, int offset, int length, String text, AttributeSet attrs)
                        throws BadLocationException {
                    String textoNuevo = (text == null) ? "" : text;
                    String cadenaActual = fb.getDocument().getText(0, fb.getDocument().getLength());
                    String resultado = cadenaActual.substring(0, offset) + textoNuevo + cadenaActual.substring(offset + length);
                    if (resultado.matches("[\\p{L}\\s'-]*")) {
                        super.replace(fb, offset, length, text, attrs);
                    }
                }

                @Override
                public void insertString(FilterBypass fb, int offset, String text, AttributeSet attr)
                        throws BadLocationException {
                    if (text == null) {
                        return;
                    }
                    String cadenaActual = fb.getDocument().getText(0, fb.getDocument().getLength());
                    String resultado = cadenaActual.substring(0, offset) + text + cadenaActual.substring(offset);
                    if (resultado.matches("[\\p{L}\\s'-]*")) {
                        super.insertString(fb, offset, text, attr);
                    }
                }
            });
        }
    }

    private void aplicarFiltroSoloNumeros(JTextField campo) {
        if (campo.getDocument() instanceof AbstractDocument documento) {
            documento.setDocumentFilter(new DocumentFilter() {
                @Override
                public void replace(FilterBypass fb, int offset, int length, String text, AttributeSet attrs)
                        throws BadLocationException {
                    String textoNuevo = text == null ? "" : text;
                    String actual = fb.getDocument().getText(0, fb.getDocument().getLength());
                    String resultado = actual.substring(0, offset) + textoNuevo + actual.substring(offset + length);
                    if (resultado.matches("\\d*")) {
                        super.replace(fb, offset, length, text, attrs);
                    }
                }

                @Override
                public void insertString(FilterBypass fb, int offset, String text, AttributeSet attrs)
                        throws BadLocationException {
                    if (text == null) {
                        return;
                    }
                    String actual = fb.getDocument().getText(0, fb.getDocument().getLength());
                    String resultado = actual.substring(0, offset) + text + actual.substring(offset);
                    if (resultado.matches("\\d*")) {
                        super.insertString(fb, offset, text, attrs);
                    }
                }
            });
        }
    }

    private Date calcularFechaDesdeEdad(int edad) {
        Calendar fecha = Calendar.getInstance();
        fecha.add(Calendar.YEAR, -edad);
        return fecha.getTime();
    }

    private int calcularEdad(Date fechaNacimiento) {
        if (fechaNacimiento == null) {
            return -1;
        }
        Calendar nacimiento = Calendar.getInstance();
        nacimiento.setTime(fechaNacimiento);
        Calendar hoy = Calendar.getInstance();
        int edad = hoy.get(Calendar.YEAR) - nacimiento.get(Calendar.YEAR);
        if (hoy.get(Calendar.MONTH) < nacimiento.get(Calendar.MONTH)
                || (hoy.get(Calendar.MONTH) == nacimiento.get(Calendar.MONTH)
                && hoy.get(Calendar.DAY_OF_MONTH) < nacimiento.get(Calendar.DAY_OF_MONTH))) {
            edad--;
        }
        return edad;
    }

    private boolean validarDatosPersona(DatosPersona datos) {
        if (datos == null) {
            return false;
        }
        return datos.identificacion != null && !datos.identificacion.isBlank()
                && datos.identificacion.matches("\\d+")
                && datos.nombre != null && !datos.nombre.isBlank()
                && datos.apellido != null && !datos.apellido.isBlank()
                && datos.edad >= 0 && datos.edad <= 99;
    }

    private JPanel crearFormulario(String[] etiquetas, JTextField... campos) {
        JPanel formulario = new JPanel(new GridLayout(0, 2, 10, 10));
        formulario.setBackground(new Color(244, 247, 251));
        formulario.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        for (int i = 0; i < campos.length; i++) {
            JLabel etiqueta = new JLabel(etiquetas[i] + ":");
            etiqueta.setForeground(new Color(50, 68, 91));
            etiqueta.setFont(new Font("Segoe UI", Font.BOLD, 12));
            formulario.add(etiqueta);
            formulario.add(campos[i]);
        }
        return formulario;
    }

    private void mostrarError(String mensaje) {
        JOptionPane.showMessageDialog(this, mensaje, "Revisa los datos", JOptionPane.WARNING_MESSAGE);
    }

    private static final class DatosPersona {
        private final String identificacion;
        private final String nombre;
        private final String apellido;
        private final int edad;

        private DatosPersona(String identificacion, String nombre, String apellido, int edad) {
            this.identificacion = identificacion;
            this.nombre = nombre;
            this.apellido = apellido;
            this.edad = edad;
        }
    }

    public static void main(String[] args) {
        javax.swing.SwingUtilities.invokeLater(() -> new inicio().setVisible(true));
    }
}
